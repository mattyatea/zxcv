import path from "node:path";
import {
  defineWorkersConfig,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";

const migrationsPath = path.join(__dirname, "migrations");
const migrations = await readD1Migrations(migrationsPath);

export default defineWorkersConfig({
  esbuild: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "@prisma/client": "@prisma/client",
      "~": path.resolve(__dirname),
      "@": path.resolve(__dirname),
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["jose", "@prisma/client"],
  },
  ssr: {
    optimizeDeps: {
      exclude: ["chai"],
    },
  },
  test: {
    setupFiles: ["./tests/apply-migrations.ts", "./tests/helpers/setup-env.ts"],
    poolOptions: {
      workers: {
        singleWorker: true,
        wrangler: {
          configPath: "./wrangler.test.jsonc",
        },
        miniflare: {
          compatibilityFlags: ["experimental", "nodejs_compat"],
          bindings: {
            MIGRATIONS: migrations,
            // Add R2 mock
            R2: {
              type: "r2",
              bucket: "test-bucket",
            },
            // Add email mock
            EMAIL_SENDER: {
              type: "send_email",
              destinationAddresses: ["*@example.com"],
            },
            // Add JWT_SECRET and other environment variables
            JWT_SECRET: "test-jwt-secret-for-testing",
            JWT_ALGORITHM: "HS256",
            JWT_EXPIRES_IN: "1h",
            REFRESH_TOKEN_EXPIRES_IN: "7d",
            EMAIL_FROM: "test@example.com",
            FRONTEND_URL: "http://localhost:3000",
            RATE_LIMIT_AUTHENTICATED: "1000",
            RATE_LIMIT_ANONYMOUS: "100",
            RATE_LIMIT_API_KEY: "5000",
          },
        },
      },
    },
    // Improve test performance
    isolate: true,
    globals: true,
    mockReset: true,
    restoreMocks: true,
    // Add coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "tests/**",
        "**/*.test.ts",
        "**/*.spec.ts",
        "node_modules/**",
        "dist/**",
        ".output/**",
        ".nuxt/**",
      ],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
  },
});