import { os, ORPCError } from '@orpc/server'
import * as z from 'zod'
import type { PrismaClient } from '@prisma/client'
import type { Context } from '../types'

const authRequired = os.use<Context>().use(async ({ context, next }) => {
  if (!context.user) {
    throw new ORPCError('Unauthorized', 'UNAUTHORIZED')
  }
  return next({ context })
})

export const rulesProcedures = {
  search: os
    .use<Context>()
    .input(z.object({
      q: z.string().optional(),
      tags: z.string().optional(),
      visibility: z.string().optional(),
      sort: z.string().optional(),
      limit: z.number().default(10),
      offset: z.number().default(0)
    }))
    .handler(async ({ input, context }) => {
      const env = context.cloudflare.env
      const prisma = env.prisma as PrismaClient
      
      const where: any = {}
      
      if (input.q) {
        where.OR = [
          { name: { contains: input.q } },
          { description: { contains: input.q } }
        ]
      }
      
      if (input.visibility && input.visibility !== 'all') {
        where.visibility = input.visibility
      }
      
      if (input.tags) {
        const tagList = input.tags.split(',').map(t => t.trim())
        where.tags = {
          hasSome: tagList
        }
      }
      
      let orderBy: any = {}
      switch (input.sort) {
        case 'created':
          orderBy = { createdAt: 'desc' }
          break
        case 'name':
          orderBy = { name: 'asc' }
          break
        default:
          orderBy = { updatedAt: 'desc' }
      }
      
      const [rules, total] = await Promise.all([
        prisma.rule.findMany({
          where,
          orderBy,
          skip: input.offset,
          take: input.limit,
          include: {
            author: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }),
        prisma.rule.count({ where })
      ])
      
      return {
        results: rules.map(rule => ({
          ...rule,
          updated_at: Math.floor(rule.updatedAt.getTime() / 1000),
          created_at: Math.floor(rule.createdAt.getTime() / 1000)
        })),
        total
      }
    }),

  get: os
    .use<Context>()
    .input(z.object({
      id: z.string()
    }))
    .handler(async ({ input, context }) => {
      const env = context.cloudflare.env
      const prisma = env.prisma as PrismaClient
      
      const rule = await prisma.rule.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          }
        }
      })
      
      if (!rule) {
        throw new Error('Rule not found')
      }
      
      return {
        ...rule,
        updated_at: Math.floor(rule.updatedAt.getTime() / 1000),
        created_at: Math.floor(rule.createdAt.getTime() / 1000)
      }
    }),

  create: authRequired
    .input(z.object({
      name: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      org: z.string().regex(/^[a-zA-Z0-9_-]*$/).optional(),
      description: z.string().optional(),
      visibility: z.enum(['public', 'private', 'team']),
      teamId: z.string().optional(),
      tags: z.array(z.string()),
      content: z.string()
    }))
    .handler(async ({ input, context }) => {
      const env = context.cloudflare.env
      const prisma = env.prisma as PrismaClient
      const user = context.user!
      
      // Check if rule name already exists
      const existingRule = await prisma.rule.findFirst({
        where: {
          name: input.name,
          authorId: user.id
        }
      })
      
      if (existingRule) {
        throw new Error('A rule with this name already exists')
      }
      
      const rule = await prisma.rule.create({
        data: {
          name: input.name,
          org: input.org,
          description: input.description,
          visibility: input.visibility,
          teamId: input.teamId,
          tags: input.tags,
          content: input.content,
          version: 1,
          authorId: user.id
        }
      })
      
      return { id: rule.id }
    }),

  update: authRequired
    .input(z.object({
      id: z.string(),
      name: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
      description: z.string().optional(),
      visibility: z.enum(['public', 'private', 'team']).optional(),
      teamId: z.string().optional(),
      tags: z.array(z.string()).optional(),
      content: z.string().optional()
    }))
    .handler(async ({ input, context }) => {
      const env = context.cloudflare.env
      const prisma = env.prisma as PrismaClient
      const user = context.user!
      
      const existingRule = await prisma.rule.findUnique({
        where: { id: input.id }
      })
      
      if (!existingRule || existingRule.authorId !== user.id) {
        throw new Error('Rule not found or unauthorized')
      }
      
      const { id, ...updateData } = input
      
      const rule = await prisma.rule.update({
        where: { id },
        data: {
          ...updateData,
          version: { increment: 1 }
        }
      })
      
      return { success: true }
    }),

  delete: authRequired
    .input(z.object({
      id: z.string()
    }))
    .handler(async ({ input, context }) => {
      const env = context.cloudflare.env
      const prisma = env.prisma as PrismaClient
      const user = context.user!
      
      const rule = await prisma.rule.findUnique({
        where: { id: input.id }
      })
      
      if (!rule || rule.authorId !== user.id) {
        throw new Error('Rule not found or unauthorized')
      }
      
      await prisma.rule.delete({
        where: { id: input.id }
      })
      
      return { success: true }
    })
}