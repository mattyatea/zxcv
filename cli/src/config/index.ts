import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ProjectConfig, ZxcvConfig, ZxcvMetadata } from "../types";

const DEFAULT_API_URL = "https://zxcv-backend-and-frontend.mattya.workers.dev/api";
const PROJECT_CONFIG_FILE = ".zxcvrc.json";
const METADATA_FILE = "zxcv-metadata.json";

export class ConfigManager {
	private globalConfig: ZxcvConfig;
	private projectConfig: ProjectConfig | null = null;
	private configDir: string;
	private configFile: string;
	private defaultRulesDir: string;

	constructor() {
		// Dynamically get directories to support testing
		const home = process.env.HOME || homedir();
		this.configDir = join(home, ".zxcv");
		this.configFile = join(this.configDir, "config.json");
		this.defaultRulesDir = join(this.configDir, "rules");

		this.ensureConfigDir();
		this.globalConfig = this.loadGlobalConfig();
		this.projectConfig = this.loadProjectConfig();
	}

	private ensureConfigDir(): void {
		if (!existsSync(this.configDir)) {
			mkdirSync(this.configDir, { recursive: true });
		}
		if (!existsSync(this.defaultRulesDir)) {
			mkdirSync(this.defaultRulesDir, { recursive: true });
		}
	}

	private loadGlobalConfig(): ZxcvConfig {
		if (existsSync(this.configFile)) {
			const content = readFileSync(this.configFile, "utf-8");
			return JSON.parse(content);
		}

		const defaultConfig: ZxcvConfig = {
			rulesDir: this.defaultRulesDir,
			symlinkDir: "rules",
			apiUrl: DEFAULT_API_URL,
		};

		this.saveGlobalConfig(defaultConfig);
		return defaultConfig;
	}

	private loadProjectConfig(): ProjectConfig | null {
		const projectConfigPath = join(process.cwd(), PROJECT_CONFIG_FILE);
		if (existsSync(projectConfigPath)) {
			const content = readFileSync(projectConfigPath, "utf-8");
			return JSON.parse(content);
		}
		return null;
	}

	private saveGlobalConfig(config: ZxcvConfig): void {
		writeFileSync(this.configFile, JSON.stringify(config, null, 2));
	}

	public getConfig(): ZxcvConfig {
		const config = { ...this.globalConfig };
		if (this.projectConfig) {
			if (this.projectConfig.rulesDir) {
				config.symlinkDir = this.projectConfig.rulesDir;
			}
			if (this.projectConfig.remoteUrl) {
				config.apiUrl = this.projectConfig.remoteUrl;
			}
		}
		return config;
	}

	public setAuthToken(token: string): void {
		this.globalConfig.auth = { token };
		this.saveGlobalConfig(this.globalConfig);
	}

	public getAuthToken(): string | undefined {
		return this.globalConfig.auth?.token;
	}

	public loadMetadata(): ZxcvMetadata | null {
		const metadataPath = join(process.cwd(), METADATA_FILE);
		if (existsSync(metadataPath)) {
			const content = readFileSync(metadataPath, "utf-8");
			return JSON.parse(content);
		}
		return null;
	}

	public saveMetadata(metadata: ZxcvMetadata): void {
		const metadataPath = join(process.cwd(), METADATA_FILE);
		writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
	}

	public getRulesDir(): string {
		return this.globalConfig.rulesDir;
	}

	public getSymlinkDir(): string {
		const config = this.getConfig();
		return join(process.cwd(), config.symlinkDir);
	}

	public getApiUrl(): string {
		// 環境変数を優先
		const envApiUrl = process.env.ZXCV_API_URL;
		if (envApiUrl) {
			return envApiUrl;
		}

		const config = this.getConfig();
		return config.apiUrl;
	}
}
