export interface Rule {
	id: string;
	name: string;
	content: string;
	description?: string;
	visibility: "public" | "private" | "organization";
	type?: "rule" | "ccsubagents" | "config";
	subType?: string | null;
	owner?: string;
	organization?: string | { id?: string; name?: string };
	tags: string[];
	version: string;
	createdAt: string;
	updatedAt: string | number;
	user?: {
		id: string;
		username: string;
		email: string;
	};
}

export interface ZxcvConfig {
	rulesDir: string;
	symlinkDir: string;
	apiUrl: string;
	auth?: {
		token?: string;
	};
}

export interface ProjectConfig {
	rulesDir?: string;
	remoteUrl?: string;
}

export interface ZxcvMetadata {
	version: string;
	lastSync: string;
	rules: PulledRule[];
}

export interface PulledRule {
	name: string; // フルパス形式 (@username/rulename or @org/rulename or rulename)
	version: string;
	pulledAt: string;
	description?: string;
	tags?: string[];
}
