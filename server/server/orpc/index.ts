import { implement } from "@orpc/server";
import { contract } from "./contracts";
import type { Context } from "./types";

const baseOS = implement(contract);
export const os = baseOS.$context<Context>();
