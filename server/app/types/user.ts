import type { InferContractRouterOutputs } from "@orpc/contract";
import type {contract} from "~/server/orpc/contracts";

type Outputs = InferContractRouterOutputs<typeof contract>; // FIXME: そのうちちゃんと定義する場所を統一して、いい感じに使うようにする

export type UserProfile = Outputs["users"]["getProfile"];
export type PublicUserProfile = Outputs["users"]["getPublicProfile"];
