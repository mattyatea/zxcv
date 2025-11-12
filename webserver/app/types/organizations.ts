import type { InferContractRouterOutputs } from "@orpc/contract";
import type { contract } from "~/server/orpc/contracts";

type Outputs = InferContractRouterOutputs<typeof contract>["organizations"]; // FIXME: そのうちちゃんと定義する場所を統一して、いい感じに使うようにする

export type OrganizationPublicProfile = Outputs["getPublicProfile"];
