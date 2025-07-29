export interface Rule {
	id: string;
	name: string;
	content: string;
	visibility: "public" | "private";
	owner?: string;
	organization?: string;
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
}
