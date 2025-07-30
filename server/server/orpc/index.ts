import { implement } from "@orpc/server";
import { contract } from "~/server/orpc/contracts";
import type { Context } from "~/server/orpc/types";

const baseOS = implement(contract);
export const os = baseOS.$context<Context>();
