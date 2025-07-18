import { describe, it, expect } from "vitest";
import type { UnstableDevWorker } from "wrangler";

declare const getMiniflareBindings: () => Record<string, unknown>;
declare const getDirectWorker: () => UnstableDevWorker;

describe("Health API", () => {
  it("should return healthy status", async () => {
    const worker = getDirectWorker();
    const response = await worker.fetch("/api/health");
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: "healthy",
      version: "1.0.0",
      environment: "development",
    });
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeDefined();
  });

  it("should have correct content type", async () => {
    const worker = getDirectWorker();
    const response = await worker.fetch("/api/health");
    
    expect(response.headers.get("content-type")).toBe("application/json");
  });
});