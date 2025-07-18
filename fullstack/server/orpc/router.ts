import { authProcedures } from './procedures/auth'
import { rulesProcedures } from './procedures/rules'
import { teamsProcedures } from './procedures/teams'

export const router = {
  auth: authProcedures,
  rules: rulesProcedures,
  teams: teamsProcedures
}