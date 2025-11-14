import fs from "node:fs";
import path from "node:path";
import { defineWorkersConfig, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

const migrationsPath = path.join(__dirname, "migrations");
const migrations = await readD1Migrations(migrationsPath);

const assetsDirectory = path.join(__dirname, "tests", "mocks", "assets");
if (!fs.existsSync(assetsDirectory)) {
        fs.mkdirSync(assetsDirectory, { recursive: true });
}

export default defineWorkersConfig({
	esbuild: {
		target: "esnext",
	},
	resolve: {
		alias: {
			"@prisma/client": path.resolve(__dirname, "tests/mocks/prisma.ts"),
			"@prisma/adapter-d1": path.resolve(__dirname, "tests/mocks/prisma.ts"),
			".prisma/client": path.resolve(__dirname, "tests/mocks/prisma.ts"),
			"~": path.resolve(__dirname),
			"@": path.resolve(__dirname),
		},
	},
	define: {
		global: "globalThis",
	},
	optimizeDeps: {
		include: ["jose", "@prisma/client", "@prisma/client/runtime/library"],
		exclude: ["@prisma/adapter-d1"],
	},
	ssr: {
		optimizeDeps: {
			exclude: ["chai", "@prisma/adapter-d1"],
			include: ["@prisma/client", "@prisma/client/runtime/library"],
		},
		external: ["@prisma/adapter-d1"],
	},
	test: {
                setupFiles: [
                        "./vitest.setup.mts",
                        "./tests/helpers/setup-env.ts",
                        "./tests/apply-migrations.ts",
                        "./tests/helpers/setup.ts",
                ],
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/tests/old/**",
			"**/tests/unit/components/**",
			"**/tests/unit/composables/**",
			"**/tests/unit/stores/**",
			"**/tests/e2e/**",
		],
		unstubGlobals: true,
		poolOptions: {
			workers: {
				singleWorker: true,
                                wrangler: {
                                        configPath: "./wrangler.test.toml",
                                },
				miniflare: {
					compatibilityFlags: ["experimental", "nodejs_compat"],
					compatibilityDate: "2025-07-15",
					bindings: {
						MIGRATIONS: migrations,
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
					d1Databases: ["DB"],
					r2Buckets: ["R2"],
					sendEmail: [
						{
							name: "EMAIL_SENDER",
							destAddress: "test@example.com",
						},
					],
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
