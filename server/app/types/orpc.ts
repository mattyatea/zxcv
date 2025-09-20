import type {InferContractRouterInputs, InferContractRouterOutputs} from "@orpc/contract";
import type { contract } from "~/server/orpc/contracts";

type RouterOutputs = InferContractRouterOutputs<typeof contract>;
type RouterInputs = InferContractRouterInputs<typeof contract>; 

// Auth関連
export type RegisterResponse = RouterOutputs["auth"]["register"];
export type LoginResponse = RouterOutputs["auth"]["login"];
export type RefreshResponse = RouterOutputs["auth"]["refresh"];
export type VerifyEmailResponse = RouterOutputs["auth"]["verifyEmail"];
export type SendPasswordResetResponse = RouterOutputs["auth"]["sendPasswordReset"];
export type ResetPasswordResponse = RouterOutputs["auth"]["resetPassword"];
export type SendVerificationResponse = RouterOutputs["auth"]["sendVerification"];
export type CheckUsernameResponse = RouterOutputs["auth"]["checkUsername"];
export type CompleteOAuthRegistrationResponse = RouterOutputs["auth"]["completeOAuthRegistration"];
export type UserType = LoginResponse["user"];
export type MeResponse = RouterOutputs["auth"]["me"];

// Rules関連
export type SearchRulesResponse = RouterOutputs["rules"]["search"];
export type RuleType = SearchRulesResponse["rules"][0];
export type ListRulesResponse = RouterOutputs["rules"]["list"];
export type CreateRuleResponse = RouterOutputs["rules"]["create"];
export type UpdateRuleResponse = RouterOutputs["rules"]["update"];
export type DeleteRuleResponse = RouterOutputs["rules"]["delete"];
export type GetRuleResponse = RouterOutputs["rules"]["get"];
export type GetByPathResponse = RouterOutputs["rules"]["getByPath"];
export type GetRuleContentResponse = RouterOutputs["rules"]["getContent"];
export type StarRuleResponse = RouterOutputs["rules"]["star"];
export type UnstarRuleResponse = RouterOutputs["rules"]["unstar"];
export type GetVersionsResponse = RouterOutputs["rules"]["versions"];
export type RuleVersionType = GetVersionsResponse[0];
export type GetRuleVersionResponse = RouterOutputs["rules"]["getVersion"];

// Organizations関連
export type ListOrganizationsResponse = RouterOutputs["organizations"]["list"];
export type OrganizationType = ListOrganizationsResponse[0];
export type CreateOrganizationResponse = RouterOutputs["organizations"]["create"];
export type GetOrganizationResponse = RouterOutputs["organizations"]["get"];
export type UpdateOrganizationResponse = RouterOutputs["organizations"]["update"];
export type DeleteOrganizationResponse = RouterOutputs["organizations"]["delete"];
export type InviteMemberResponse = RouterOutputs["organizations"]["inviteMember"];
export type RemoveMemberResponse = RouterOutputs["organizations"]["removeMember"];
export type AcceptInvitationResponse = RouterOutputs["organizations"]["acceptInvitation"];
export type GetPublicOrganizationResponse = RouterOutputs["organizations"]["getPublicProfile"];

// Users関連
export type SearchUsersResponse = RouterOutputs["users"]["searchByUsername"];
export type SearchUserType = SearchUsersResponse[0];
export type GetUserProfileResponse = RouterOutputs["users"]["getProfile"];
export type GetUserPublicProfileResponse = RouterOutputs["users"]["getPublicProfile"];

// Health関連
export type HealthCheckResponse = RouterOutputs["health"]["check"];

// Input types from RPC contracts
export type RegisterInput = RouterInputs["auth"]["register"];
export type LoginInput = RouterInputs["auth"]["login"];
export type UpdateProfileInput = RouterInputs["users"]["updateProfile"];
export type CreateRuleInput = RouterInputs["rules"]["create"];
export type UpdateRuleInput = RouterInputs["rules"]["update"];
export type CreateOrganizationInput = RouterInputs["organizations"]["create"];
export type UpdateOrganizationInput = RouterInputs["organizations"]["update"];