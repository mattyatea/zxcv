import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

describe("RPC usage policy", () => {
  it("forbids direct $rpc access via useNuxtApp() in frontend", () => {
    const appRoot = join(process.cwd(), "server", "app");
    const files = walk(appRoot).filter((f) => /\.(ts|vue|tsx|jsx)$/.test(f));

    const allowList = new Set<string>([
      join(appRoot, "composables", "useRpc.ts"),
      // Plugins can provide $rpc
      join(appRoot, "plugins", "orpc.ts"),
    ]);

    const violations: { file: string; line: number; text: string }[] = [];

    const reDirectCall = /useNuxtApp\s*\(\)\s*\.\s*\$rpc/;
    const reDestructure = /\{\s*\$rpc\s*\}\s*=\s*useNuxtApp\s*\(\)/;

    for (const file of files) {
      if (allowList.has(file)) continue;
      const rel = relative(process.cwd(), file);
      const content = readFileSync(file, "utf8");
      const lines = content.split(/\r?\n/);
      lines.forEach((raw, idx) => {
        const line = raw.trim();
        // ignore obvious single-line comments
        if (line.startsWith("//")) return;
        if (reDirectCall.test(line) || reDestructure.test(line)) {
          violations.push({ file: rel, line: idx + 1, text: raw });
        }
      });
    }

    if (violations.length) {
      const msg = violations
        .map((v) => `${v.file}:${v.line}: ${v.text.trim()}`)
        .join("\n");
      expect.fail(
        `Do not access $rpc directly via useNuxtApp(). Use useRpc() instead.\n${msg}`,
      );
    }

    expect(true).toBe(true);
  });
});

