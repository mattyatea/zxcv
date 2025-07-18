// This file is required for vitest workers pool
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    // This is a placeholder for tests
    return new Response("Test worker", { status: 200 });
  },
};