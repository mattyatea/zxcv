/// <reference path="./worker-configuration.d.ts" />

// Re-export global types from worker-configuration.d.ts for IDE recognition
declare global {
  // These types are available globally from worker-configuration.d.ts
  type CloudflareEnv = Env;
}

export {};