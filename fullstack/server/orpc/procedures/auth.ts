import { os, ORPCError } from '@orpc/server'
import * as z from 'zod'
import { hashPassword, verifyPassword } from '~/server/utils/crypto'
import { createJWT } from '~/server/utils/jwt'
import type { PrismaClient } from '@prisma/client'
import type { Context } from '../types'

export const authProcedures = {
  register: os
    .use<Context>()
    .input(z.object({
      username: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/),
      email: z.string().email(),
      password: z.string().min(8)
    }))
    .handler(async ({ input, context }) => {
      const env = context.cloudflare.env
      const { username, email, password } = input

      const prisma = env.prisma as PrismaClient
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
          ]
        }
      })

      if (existingUser) {
        throw new Error('User already exists')
      }

      const hashedPassword = await hashPassword(password)
      const user = await prisma.user.create({
        data: {
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          password: hashedPassword,
          emailVerified: false
        }
      })

      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    }),

  login: os
    .use<Context>()
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
      rememberMe: z.boolean().optional()
    }))
    .handler(async ({ input, context }) => {
      const env = context.cloudflare.env
      const { email, password } = input

      const prisma = env.prisma as PrismaClient
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (!user) {
        throw new Error('Invalid email or password')
      }

      const isValidPassword = await verifyPassword(password, user.password)
      if (!isValidPassword) {
        throw new Error('Invalid email or password')
      }

      const authUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified
      }

      const token = await createJWT({
        sub: authUser.id,
        email: authUser.email,
        username: authUser.username,
        emailVerified: authUser.emailVerified
      }, env)

      return {
        token,
        user: authUser,
        message: user.emailVerified ? undefined : 'Please verify your email before logging in.'
      }
    }),

  refresh: os
    .use<Context>()
    .handler(async ({ context }) => {
      if (!context.user) {
        throw new Error('Unauthorized')
      }

      const env = context.cloudflare.env
      const token = await createJWT({
        sub: context.user.id,
        email: context.user.email,
        username: context.user.username,
        emailVerified: context.user.emailVerified
      }, env)

      return { token, user: context.user }
    }),

  verify: os
    .use<Context>()
    .input(z.object({
      token: z.string()
    }))
    .handler(async ({ input, context }) => {
      const env = context.cloudflare.env
      const { token } = input

      const prisma = env.prisma as PrismaClient
      const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true }
      })

      if (!verificationToken || verificationToken.expiresAt < new Date()) {
        throw new Error('Invalid or expired verification token')
      }

      await prisma.user.update({
        where: { id: verificationToken.user.id },
        data: { emailVerified: true }
      })

      await prisma.emailVerificationToken.delete({
        where: { token }
      })

      return {
        success: true,
        message: 'Email verified successfully. You can now log in.'
      }
    }),

  forgotPassword: os
    .use<Context>()
    .input(z.object({
      email: z.string().email()
    }))
    .handler(async ({ input, context }) => {
      const env = context.cloudflare.env
      const { email } = input
      
      const prisma = env.prisma as PrismaClient
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      })
      
      // Always return success to prevent email enumeration
      if (user) {
        // Generate reset token
        const { generateId } = await import('~/server/utils/crypto')
        const resetToken = generateId()
        const expiresAt = Math.floor(Date.now() / 1000) + 3600 // 1 hour
        const now = Math.floor(Date.now() / 1000)
        
        // Store reset token in database
        await prisma.passwordReset.create({
          data: {
            id: generateId(),
            userId: user.id,
            token: resetToken,
            expiresAt,
            createdAt: now
          }
        })
        
        // Send password reset email
        const { EmailService } = await import('~/server/utils/email')
        const emailService = new EmailService(env)
        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`
        
        // Use default locale for now
        const userLocale = 'en'
        
        const emailTemplate = emailService.generatePasswordResetEmail({
          email,
          resetToken,
          resetUrl,
          userLocale
        })
        
        await emailService.sendEmail(emailTemplate)
      }
      
      return {
        message: 'If an account exists with this email, a password reset link has been sent.'
      }
    })
}