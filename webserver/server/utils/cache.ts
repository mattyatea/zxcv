import type { Env } from "../types/env";

export interface CacheOptions {
	ttl?: number; // Time to live in seconds
	namespace?: string;
}

export class Cache {
	private kv: KVNamespace;
	private defaultTTL: number;
	private namespace: string;

	constructor(kv: KVNamespace, options: CacheOptions = {}) {
		this.kv = kv;
		this.defaultTTL = options.ttl || 300; // 5 minutes default
		this.namespace = options.namespace || "zxcv";
	}

	private buildKey(key: string): string {
		return `${this.namespace}:${key}`;
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			const value = await this.kv.get(this.buildKey(key), "json");
			return value as T | null;
		} catch (_error) {
			return null;
		}
	}

	async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		try {
			await this.kv.put(this.buildKey(key), JSON.stringify(value), {
				expirationTtl: ttl || this.defaultTTL,
			});
		} catch (_error) {
			// Ignore error if cache write fails
		}
	}

	async delete(key: string): Promise<void> {
		try {
			await this.kv.delete(this.buildKey(key));
		} catch (_error) {
			// Ignore error if cache delete fails
		}
	}

	async getOrSet<T>(
		key: string,
		fetchFn: () => Promise<T>,
		ttl?: number,
	): Promise<T> {
		const cached = await this.get<T>(key);
		if (cached !== null) {
			return cached;
		}

		const value = await fetchFn();
		await this.set(key, value, ttl);
		return value;
	}

	// Generate cache key for search queries
	static generateSearchKey(params: {
		q?: string;
		tags?: string;
		author?: string;
		org?: string;
		visibility?: string;
		sort?: string;
		order?: string;
		limit?: number;
		offset?: number;
		userId?: string;
	}): string {
		const normalized = {
			...params,
			q: params.q?.toLowerCase().trim() || "",
			tags: params.tags?.toLowerCase().trim() || "",
			author: params.author?.toLowerCase().trim() || "",
			org: params.org?.toLowerCase().trim() || "",
		};

		return `search:${JSON.stringify(normalized)}`;
	}

	// Generate cache key for organization membership
	static generateOrganizationMembershipKey(
		userId: string,
		organizationId: string,
	): string {
		return `organization_membership:${userId}:${organizationId}`;
	}

	// Generate cache key for user organizations
	static generateUserOrganizationsKey(userId: string): string {
		return `user_organizations:${userId}`;
	}
}

export function createCache(env: Env): Cache {
	return new Cache(env.KV_CACHE, {
		ttl: 300, // 5 minutes
		namespace: "zxcv",
	});
}
