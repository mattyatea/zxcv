import axios, { type AxiosInstance } from "axios";
import type { ConfigManager } from "../config";
import type { Rule } from "../types";
import { debugLogger } from "./debug";

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
		const response = await this.client.post("/api/auth/login", {
			username,
			password,
		});
		return response.data;
	}

	async register(username: string, email: string, password: string): Promise<void> {
		await this.client.post("/api/auth/register", {
			username,
			email,
			password,
		});
	}

	async getRule(path: string): Promise<Rule> {
		const response = await this.client.post("/api/rules/getByPath", {
			path,
		});
		return response.data;
	}

	async getRuleContent(ruleId: string): Promise<{ content: string }> {
		const response = await this.client.post("/api/rules/getContent", {
			ruleId,
		});
		return response.data;
	}

	async createRule(rule: {
		name: string;
		content: string;
		visibility: "public" | "private";
		tags: string[];
	}): Promise<Rule> {
		const response = await this.client.post("/api/rules/create", rule);
		return response.data;
	}

	async updateRule(
		ruleId: string,
		updates: {
			name?: string;
			content?: string;
			visibility?: "public" | "private";
			tags?: string[];
			changelog?: string;
		},
	): Promise<Rule> {
		const response = await this.client.post("/api/rules/update", {
			ruleId,
			...updates,
		});
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
		const response = await this.client.post("/api/rules/search", query);
		return response.data.rules;
	}

	async getRuleVersions(ruleId: string): Promise<
		Array<{
			version: string;
			changelog: string;
			createdAt: string;
		}>
	> {
		const response = await this.client.post("/api/rules/versions", {
			ruleId,
		});
		return response.data.versions;
	}
}
