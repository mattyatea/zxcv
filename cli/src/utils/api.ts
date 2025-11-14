import axios, { type AxiosInstance } from "axios";
import type { ConfigManager } from "../config";
import type { Rule } from "../types";
import { debugLogger } from "./debug";

interface DeviceAuthData {
	deviceCode: string;
	userCode: string;
	verificationUri: string;
	verificationUriComplete?: string;
	expiresIn: number;
	interval: number;
}

export class ApiClient {
	private client: AxiosInstance;
	private config: ConfigManager;

	constructor(config: ConfigManager) {
		this.config = config;
		this.client = axios.create({
			baseURL: config.getApiUrl(),
			headers: {
				"Content-Type": "application/json",
			},
		});

		this.client.interceptors.request.use((config) => {
			const token = this.config.getAuthToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			debugLogger.logRequest(config);
			return config;
		});

		this.client.interceptors.response.use(
			(response) => {
				debugLogger.logResponse(response);
				return response;
			},
			(error) => {
				debugLogger.logError(error);
				return Promise.reject(error);
			},
		);
	}

	async login(username: string, password: string): Promise<{ token: string }> {
		const response = await this.client.post("/auth/login", {
			username,
			password,
		});
		return response.data;
	}

	async register(username: string, email: string, password: string): Promise<void> {
		await this.client.post("/auth/register", {
			username,
			email,
			password,
		});
	}

	async getRule(path: string): Promise<Rule> {
		const response = await this.client.post("/rules/getByPath", {
			path,
		});
		return response.data;
	}

	async getRuleContent(
		ruleId: string,
		version?: string,
	): Promise<{ content: string; version: string }> {
		const response = await this.client.post("/rules/getContent", {
			id: ruleId,
			...(version && { version }),
		});
		return response.data;
	}

	async createRule(rule: {
		name: string;
		content: string;
		visibility: "public" | "private" | "organization";
		tags: string[];
		type?: "rule" | "ccsubagents" | "config";
		subType?: string | null;
		organizationId?: string;
	}): Promise<Rule> {
		const response = await this.client.post("/rules/create", rule);
		return response.data;
	}

	async updateRule(
		ruleId: string,
		updates: {
			name?: string;
			content?: string;
			visibility?: "public" | "private" | "organization";
			tags?: string[];
			changelog?: string;
			type?: "rule" | "ccsubagents" | "config";
			subType?: string | null;
			organizationId?: string | null;
		},
	): Promise<Rule> {
		const response = await this.client.post("/rules/update", {
			ruleId,
			...updates,
		});
		return response.data;
	}

	async getCurrentUser(): Promise<{ id: string; username: string }> {
		const response = await this.client.get("/users/me");
		return response.data;
	}

	async listOrganizations(): Promise<Array<{ id: string; name: string; displayName: string }>> {
		const response = await this.client.get("/organizations/list");
		return response.data;
	}

	async searchRules(query: {
		searchTerm?: string;
		tags?: string[];
		visibility?: "public" | "private";
		owner?: string;
		limit?: number;
		offset?: number;
	}): Promise<Rule[]> {
		const response = await this.client.post("/rules/search", query);
		return response.data.rules;
	}

	async getRuleVersions(ruleId: string): Promise<
		Array<{
			version: string;
			changelog: string;
			createdAt: string;
		}>
	> {
		const response = await this.client.post("/rules/versions", {
			ruleId,
		});
		return response.data.versions;
	}

	// Device Authorization Grant methods
	async initializeDeviceAuth(): Promise<DeviceAuthData> {
		const response = await this.client.post("/auth/device/authorize", {
			clientId: "cli",
			scope: "read write",
		});
		return response.data;
	}

	async pollForDeviceToken(
		deviceCode: string,
		interval: number,
		expiresIn: number,
	): Promise<string> {
		const startTime = Date.now();
		let currentInterval = interval;

		while (Date.now() - startTime < expiresIn * 1000) {
			await new Promise((resolve) => setTimeout(resolve, currentInterval * 1000));

			try {
				const response = await this.client.post("/auth/device/token", {
					deviceCode,
					clientId: "cli",
				});

				// Check if we got an error response
				if (response.data.error) {
					switch (response.data.error) {
						case "authorization_pending":
							// Continue polling
							continue;
						case "slow_down":
							// Increase polling interval
							currentInterval = Math.min(currentInterval * 2, 30);
							continue;
						case "expired_token":
							throw new Error("Device code has expired. Please try again.");
						case "access_denied":
							throw new Error("Authorization was denied.");
						default:
							throw new Error(response.data.errorDescription || "Unknown error occurred");
					}
				}

				// Success! We got the token
				if (response.data.accessToken) {
					return response.data.accessToken;
				}
			} catch (error) {
				// Handle network errors
				if (axios.isAxiosError(error) && error.response?.status === 500) {
					throw new Error("Server error occurred. Please try again later.");
				}
				throw error;
			}
		}

		throw new Error("Authorization timed out. Please try again.");
	}
}
