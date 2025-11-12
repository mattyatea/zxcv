import type { Context } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger, Logger, LogLevel, requestTimingMiddleware } from "~/server/utils/logger";

describe("Logger", () => {
	let consoleLogSpy: any;
	let logger: Logger;

	beforeEach(() => {
		vi.clearAllMocks();
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		logger = new Logger();
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	describe("constructor", () => {
		it("should use default log level INFO", () => {
			const l = new Logger();
			expect(l.minLevel).toBe(LogLevel.INFO);
		});

		it("should accept custom log level", () => {
			const l = new Logger(LogLevel.DEBUG);
			expect(l.minLevel).toBe(LogLevel.DEBUG);
		});
	});

	describe("shouldLog", () => {
		it("should log when level is equal to minLevel", () => {
			const l = new Logger(LogLevel.INFO);
			expect(l.shouldLog(LogLevel.INFO)).toBe(true);
		});

		it("should log when level is greater than minLevel", () => {
			const l = new Logger(LogLevel.INFO);
			expect(l.shouldLog(LogLevel.ERROR)).toBe(true);
		});

		it("should not log when level is less than minLevel", () => {
			const l = new Logger(LogLevel.WARN);
			expect(l.shouldLog(LogLevel.INFO)).toBe(false);
		});
	});

	describe("createLogEntry", () => {
		it("should create basic log entry", () => {
			const entry = logger.createLogEntry(LogLevel.INFO, "Test message");

			expect(entry.level).toBe("INFO");
			expect(entry.message).toBe("Test message");
			expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
		});

		it("should include context when provided", () => {
			const context = { userId: "123", action: "login" };
			const entry = logger.createLogEntry(LogLevel.INFO, "Test message", context);

			expect(entry.context).toEqual(context);
		});

		it("should include error details when provided", () => {
			const error = new Error("Test error");
			error.stack = "Error stack trace";
			const entry = logger.createLogEntry(LogLevel.ERROR, "Error occurred", undefined, error);

			expect(entry.error).toEqual({
				name: "Error",
				message: "Test error",
				stack: "Error stack trace",
			});
		});

		it("should include logger context", () => {
			logger.context = { requestId: "req-123" };
			const entry = logger.createLogEntry(LogLevel.INFO, "Test message");

			expect(entry.requestId).toBe("req-123");
		});
	});

	describe("log methods", () => {
		it("should log debug messages when level allows", () => {
			const debugLogger = new Logger(LogLevel.DEBUG);
			debugLogger.debug("Debug message", { extra: "data" });

			expect(consoleLogSpy).toHaveBeenCalled();
			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.level).toBe("DEBUG");
			expect(loggedData.message).toBe("Debug message");
			expect(loggedData.context).toEqual({ extra: "data" });
		});

		it("should not log debug messages when level is higher", () => {
			logger.debug("Debug message");
			expect(consoleLogSpy).not.toHaveBeenCalled();
		});

		it("should log info messages", () => {
			logger.info("Info message");

			expect(consoleLogSpy).toHaveBeenCalled();
			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.level).toBe("INFO");
			expect(loggedData.message).toBe("Info message");
		});

		it("should log warn messages", () => {
			logger.warn("Warning message", { severity: "high" });

			expect(consoleLogSpy).toHaveBeenCalled();
			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.level).toBe("WARN");
			expect(loggedData.message).toBe("Warning message");
			expect(loggedData.context).toEqual({ severity: "high" });
		});

		it("should log error messages with error object", () => {
			const error = new Error("Test error");
			logger.error("Error occurred", error, { operation: "save" });

			expect(consoleLogSpy).toHaveBeenCalled();
			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.level).toBe("ERROR");
			expect(loggedData.message).toBe("Error occurred");
			expect(loggedData.error.message).toBe("Test error");
			expect(loggedData.context).toEqual({ operation: "save" });
		});
	});

	describe("child", () => {
		it("should create child logger with additional context", () => {
			logger.context = { parentId: "parent-123" };
			const childLogger = logger.child({ childId: "child-456" });

			childLogger.info("Child message");

			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.parentId).toBe("parent-123");
			expect(loggedData.childId).toBe("child-456");
		});

		it("should inherit minLevel from parent", () => {
			const parentLogger = new Logger(LogLevel.WARN);
			const childLogger = parentLogger.child({ childId: "123" });

			expect(childLogger.minLevel).toBe(LogLevel.WARN);
		});
	});

	describe("setRequestContext", () => {
		it("should set request context from Hono context", () => {
			const mockContext = {
				req: {
					method: "GET",
					url: "https://example.com/api/test",
					header: vi.fn().mockReturnValue({
						"user-agent": "Test Agent",
						"cf-connecting-ip": "192.168.1.1",
						"x-request-id": "req-123",
					}),
				},
			} as any;

			logger.setRequestContext(mockContext);
			logger.info("Request processed");

			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.requestId).toBe("req-123");
			expect(loggedData.method).toBe("GET");
			expect(loggedData.url).toBe("https://example.com/api/test");
			expect(loggedData.userAgent).toBe("Test Agent");
			expect(loggedData.ip).toBe("192.168.1.1");
		});

		it("should generate requestId if not provided", () => {
			const mockUUID = "generated-uuid-1234-5678-90ab-cdef01234567";
			vi.spyOn(crypto, "randomUUID").mockReturnValue(
				mockUUID as `${string}-${string}-${string}-${string}-${string}`,
			);

			const mockContext = {
				req: {
					method: "POST",
					url: "https://example.com/api/test",
					header: vi.fn().mockReturnValue({}),
				},
			} as any;

			logger.setRequestContext(mockContext);

			expect(logger.context.requestId).toBe(mockUUID);
		});

		it("should prefer cf-connecting-ip over x-forwarded-for", () => {
			const mockContext = {
				req: {
					method: "GET",
					url: "https://example.com/api/test",
					header: vi.fn().mockReturnValue({
						"x-forwarded-for": "10.0.0.1",
						"cf-connecting-ip": "192.168.1.1",
					}),
				},
			} as any;

			logger.setRequestContext(mockContext);

			expect(logger.context.ip).toBe("192.168.1.1");
		});
	});

	describe("setUserContext", () => {
		it("should set user context", () => {
			logger.setUserContext("user-123", "testuser");
			logger.info("User action");

			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.userId).toBe("user-123");
			expect(loggedData.username).toBe("testuser");
		});

		it("should work without username", () => {
			logger.setUserContext("user-123");
			logger.info("User action");

			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.userId).toBe("user-123");
			expect(loggedData.username).toBeUndefined();
		});
	});

	describe("specialized logging methods", () => {
		it("should log API request completion", () => {
			const startTime = Date.now() - 100;
			logger.logApiRequest(startTime, 200, { endpoint: "/api/test" });

			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.message).toBe("API request completed");
			expect(loggedData.context.status).toBe(200);
			expect(loggedData.context.duration).toBeGreaterThanOrEqual(100);
			expect(loggedData.context.endpoint).toBe("/api/test");
		});

		it("should log database query", () => {
			const debugLogger = new Logger(LogLevel.DEBUG);
			debugLogger.logDatabaseQuery("SELECT * FROM users", 45, 10);

			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.level).toBe("DEBUG");
			expect(loggedData.message).toBe("Database query executed");
			expect(loggedData.context).toEqual({
				query: "SELECT * FROM users",
				duration: 45,
				recordCount: 10,
			});
		});

		it("should log authentication events", () => {
			logger.logAuthEvent("login_success", "user-123", { method: "password" });

			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.message).toBe("Auth event: login_success");
			expect(loggedData.context).toEqual({
				userId: "user-123",
				method: "password",
			});
		});

		it("should log rate limit events", () => {
			logger.logRateLimit("exceeded", "192.168.1.1", 100, 101);

			const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
			expect(loggedData.level).toBe("WARN");
			expect(loggedData.message).toBe("Rate limit exceeded");
			expect(loggedData.context).toEqual({
				identifier: "192.168.1.1",
				limit: 100,
				current: 101,
			});
		});
	});
});

describe("createLogger", () => {
	it("should create logger with DEBUG level in test environment", () => {
		const logger = createLogger();
		expect(logger.minLevel).toBe(LogLevel.DEBUG);
	});
});

describe("requestTimingMiddleware", () => {
	let mockContext: Context;
	let nextFn: ReturnType<typeof vi.fn>;
	let consoleLogSpy: any;

	beforeEach(() => {
		vi.clearAllMocks();
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		nextFn = vi.fn().mockResolvedValue(undefined);
		mockContext = {
			env: {},
			req: {
				method: "GET",
				url: "https://example.com/api/test",
				header: vi.fn().mockReturnValue({}),
			},
			res: {
				status: 200,
			},
			set: vi.fn(),
		} as any;
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	it("should set logger and startTime on context", async () => {
		const middleware = requestTimingMiddleware();
		await middleware(mockContext, nextFn);

		expect(mockContext.set).toHaveBeenCalledWith("logger", expect.any(Logger));
		expect(mockContext.set).toHaveBeenCalledWith("startTime", expect.any(Number));
	});

	it("should call next function", async () => {
		const middleware = requestTimingMiddleware();
		await middleware(mockContext, nextFn);

		expect(nextFn).toHaveBeenCalled();
	});

	it("should log request completion with timing", async () => {
		const middleware = requestTimingMiddleware();

		// Add delay to ensure measurable duration
		nextFn.mockImplementation(async () => {
			await new Promise((resolve) => setTimeout(resolve, 50));
		});

		await middleware(mockContext, nextFn);

		// Should log twice: once for setting context, once for completion
		expect(consoleLogSpy).toHaveBeenCalledTimes(2);

		const loggedData = JSON.parse(consoleLogSpy.mock.calls[1][0]);
		expect(loggedData.message).toBe("API request completed");
		expect(loggedData.context.status).toBe(200);
		expect(loggedData.context.duration).toBeGreaterThanOrEqual(10);
	});
});
