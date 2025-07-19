import type { RouterClient } from '@orpc/server'
import { authProcedures } from '~/server/orpc/procedures/auth'
import { rulesProcedures } from '~/server/orpc/procedures/rules'
import { teamsProcedures } from '~/server/orpc/procedures/teams'
import { usersProcedures } from '~/server/orpc/procedures/users'
import { healthProcedures } from '~/server/orpc/procedures/health'

export const router = {
  auth: authProcedures,
  rules: rulesProcedures,
  teams: teamsProcedures,
  users: usersProcedures,
  health: healthProcedures
}

export type Router = RouterClient<typeof router>