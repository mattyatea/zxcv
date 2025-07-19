/// <reference types="./worker-configuration.d.ts" />
import type { CloudflareBindings } from "./server/types/bindings";

declare module "h3" {
  interface H3EventContext {
    cf: CfProperties;
    cloudflare: {
      request: Request;
      env: CloudflareBindings;
      context: ExecutionContext;
    };
  }
}

export {};
