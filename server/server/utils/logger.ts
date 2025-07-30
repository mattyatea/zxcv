/** biome-ignore-all lint/style/useNamingConvention: Constantsな値には、大文字を使うので... */
import type { Context } from "hono";
import type { Env } from "~/server/types/env";

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

export interface LogEntry {
	timestamp: string;
	level: string;
	message: string;
	context?: Record<string, unknown>;
	error?: {
		name: string;
		message: string;
		stack?: string;
	};
	requestId?: string;
	userId?: string;
	userAgent?: string;
	ip?: string;
	method?: string;
	url?: string;
	duration?: number;
	status?: number;
}

export class Logger {
	private minLevel: LogLevel;
	private context: Record<string, unknown>;

	constructor(minLevel: LogLevel = LogLevel.INFO) {
		this.minLevel = minLevel;
		this.context = {};
	}

	private shouldLog(level: LogLevel): boolean {
		return level >= this.minLevel;
	}

	private createLogEntry(
		level: LogLevel,
		message: string,
		context?: Record<string, unknown>,
		error?: Error,
	): LogEntry {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level: LogLevel[level],
			message,
			...this.context,
		};

		if (context) {
			entry.context = context;
		}

		if (error) {
			entry.error = {
				name: error.name,
				message: error.message,
				stack: error.stack,
			};
		}

		return entry;
	}

	private log(
		level: LogLevel,
		message: string,
		context?: Record<string, unknown>,
		error?: Error,
	): void {
		if (!this.shouldLog(level)) {
			return;
		}

		const entry = this.createLogEntry(level, message, context, error);

		// In production, you might want to send logs to external service
		// For now, we'll use console with structured JSON
		console.log(JSON.stringify(entry));
	}

	debug(message: string, context?: Record<string, unknown>): void {
		this.log(LogLevel.DEBUG, message, context);
	}

	info(message: string, context?: Record<string, unknown>): void {
		this.log(LogLevel.INFO, message, context);
	}

	warn(message: string, context?: Record<string, unknown>): void {
		this.log(LogLevel.WARN, message, context);
	}

	error(message: string, error?: Error, context?: Record<string, unknown>): void {
		this.log(LogLevel.ERROR, message, context, error);
	}

	// Create a child logger with additional context
	child(context: Record<string, unknown>): Logger {
		const childLogger = new Logger(this.minLevel);
		childLogger.context = { ...this.context, ...context };
		return childLogger;
	}

	// Set request context from Hono context
	setRequestContext(c: Context): void {
		const headers = c.req.header();
		this.context = {
			...this.context,
			requestId: headers["x-request-id"] || crypto.randomUUID(),
			method: c.req.method,
			url: c.req.url,
			userAgent: headers["user-agent"],
			ip: headers["cf-connecting-ip"] || headers["x-forwarded-for"],
		};
	}

	// Set user context
	setUserContext(userId: string, username?: string): void {
		this.context = {
			...this.context,
			userId,
			username,
		};
	}

	// Log API request completion
	logApiRequest(
		startTime: number,
		status: number,
		additionalContext?: Record<string, unknown>,
	): void {
		const duration = Date.now() - startTime;
		this.info("API request completed", {
			duration,
			status,
			...additionalContext,
		});
	}

	// Log database query
	logDatabaseQuery(query: string, duration: number, recordCount?: number): void {
		this.debug("Database query executed", {
			query,
			duration,
			recordCount,
		});
	}

	// Log authentication events
	logAuthEvent(event: string, userId?: string, context?: Record<string, unknown>): void {
		this.info(`Auth event: ${event}`, {
			userId,
			...context,
		});
	}

	// Log rate limiting events
	logRateLimit(event: string, identifier: string, limit: number, current: number): void {
		this.warn(`Rate limit ${event}`, {
			identifier,
			limit,
			current,
		});
	}
}

// Create logger instance
export function createLogger(_env?: Env): Logger {
	// In production, you might want to set log level from environment
	const minLevel = LogLevel.INFO; // Always use INFO level for now
	return new Logger(minLevel);
}

// Request timing middleware
export function requestTimingMiddleware() {
	return async (c: Context, next: () => Promise<void>) => {
		const startTime = Date.now();
		const logger = createLogger(c.env as Env);

		logger.setRequestContext(c);
		c.set("logger", logger);
		c.set("startTime", startTime);

		await next();

		const duration = Date.now() - startTime;
		logger.logApiRequest(startTime, c.res.status, { duration });
	};
}

// Performance monitoring utilities
// export class PerformanceMonitor {
// 	private static timers: Map<string, number> = new Map();
//
// 	static startTimer(name: string): void {
// 		PerformanceMonitor.timers.set(name, Date.now());
// 	}
//
// 	static endTimer(name: string): number {
// 		const startTime = PerformanceMonitor.timers.get(name);
// 		if (!startTime) {
// 			throw new Error(`Timer ${name} not found`);
// 		}
//
// 		const duration = Date.now() - startTime;
// 		PerformanceMonitor.timers.delete(name);
// 		return duration;
// 	}
//
// 	static async measure<T>(name: string, operation: () => Promise<T>): Promise<T> {
// 		PerformanceMonitor.startTimer(name);
// 		try {
// 			const result = await operation();
// 			const duration = PerformanceMonitor.endTimer(name);
// 			console.log(`Operation ${name} took ${duration}ms`);
// 			return result;
// 		} catch (error) {
// 			PerformanceMonitor.endTimer(name);
// 			throw error;
// 		}
// 	}
// }
