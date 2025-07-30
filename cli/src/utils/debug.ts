import type { AxiosRequestConfig, AxiosResponse } from "axios";
import chalk from "chalk";

export class DebugLogger {
	private enabled: boolean;

	constructor(enabled = false) {
		this.enabled = enabled;
	}

	setEnabled(enabled: boolean) {
		this.enabled = enabled;
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	logRequest(config: AxiosRequestConfig) {
		if (!this.enabled) {
			return;
		}

		console.log(chalk.gray(`\n${"=".repeat(60)}`));
		console.log(chalk.blue.bold("🔍 API Request"));
		console.log(chalk.gray("=".repeat(60)));
		console.log(chalk.cyan("Method:"), config.method?.toUpperCase());
		console.log(chalk.cyan("URL:"), config.url);
		console.log(chalk.cyan("Base URL:"), config.baseURL);

		if (config.headers) {
			console.log(chalk.cyan("Headers:"));
			for (const [key, value] of Object.entries(config.headers)) {
				if (key.toLowerCase() === "authorization") {
					console.log(`  ${key}: Bearer ***`);
				} else {
					console.log(`  ${key}: ${value}`);
				}
			}
		}

		if (config.params) {
			console.log(chalk.cyan("Query Params:"));
			console.log(JSON.stringify(config.params, null, 2));
		}

		if (config.data) {
			console.log(chalk.cyan("Request Body:"));
			const dataCopy = { ...config.data };
			if (dataCopy.password) {
				dataCopy.password = "***";
			}
			console.log(JSON.stringify(dataCopy, null, 2));
		}
		console.log(chalk.gray("-".repeat(60)));
	}

	logResponse(response: AxiosResponse) {
		if (!this.enabled) {
			return;
		}

		console.log(chalk.green.bold("✅ API Response"));
		console.log(chalk.gray("-".repeat(60)));
		console.log(chalk.cyan("Status:"), response.status, response.statusText);
		console.log(chalk.cyan("Headers:"));
		for (const [key, value] of Object.entries(response.headers)) {
			console.log(`  ${key}: ${value}`);
		}

		if (response.data) {
			console.log(chalk.cyan("Response Body:"));
			const dataCopy = typeof response.data === "object" ? { ...response.data } : response.data;
			if (dataCopy.token) {
				dataCopy.token = "***";
			}
			console.log(JSON.stringify(dataCopy, null, 2));
		}
		console.log(chalk.gray(`${"=".repeat(60)}\n`));
	}

	logError(error: unknown) {
		if (!this.enabled) {
			return;
		}

		console.log(chalk.red.bold("❌ API Error"));
		console.log(chalk.gray("-".repeat(60)));

		// Type guard for axios error
		if (error && typeof error === "object" && "response" in error && error.response) {
			const axiosError = error as {
				response: { status: number; statusText: string; data: unknown };
			};
			console.log(
				chalk.cyan("Status:"),
				axiosError.response.status,
				axiosError.response.statusText,
			);
			console.log(chalk.cyan("Error Response:"));
			console.log(JSON.stringify(axiosError.response.data, null, 2));
		} else if (error && typeof error === "object" && "request" in error && error.request) {
			const axiosError = error as { request: unknown };
			console.log(chalk.red("No response received from server"));
			console.log(chalk.cyan("Request:"), axiosError.request);
		} else if (error instanceof Error) {
			console.log(chalk.red("Error:"), error.message);
		} else {
			console.log(chalk.red("Error:"), error);
		}
		console.log(chalk.gray(`${"=".repeat(60)}\n`));
	}

	log(message: string, ...args: unknown[]) {
		if (!this.enabled) {
			return;
		}
		console.log(chalk.yellow("[DEBUG]"), message, ...args);
	}
}

export const debugLogger = new DebugLogger();
