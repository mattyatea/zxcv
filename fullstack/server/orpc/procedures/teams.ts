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

export const teamsProcedures = {
  list: authRequired
    .handler(async ({ context }) => {
      const env = context.cloudflare.env
      const prisma = env.prisma as PrismaClient
      const user = context.user!
      
      const teams = await prisma.team.findMany({
        where: {
          members: {
            some: {
              userId: user.id
            }
          }
        },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        }
      })
      
      return {
        results: teams.map(team => ({
          id: team.id,
          name: team.name,
          displayName: team.displayName,
          owner: team.owner,
          membersCount: team._count.members
        }))
      }
    })
}