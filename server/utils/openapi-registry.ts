import type { OpenAPIPath, OpenAPIOperation } from './openapi';
import { z } from 'zod';
import { zodToOpenAPISchema } from './openapi';

class OpenAPIRegistry {
	private paths: Record<string, OpenAPIPath> = {};
	private schemas: Record<string, any> = {};
	
	registerPath(path: string, method: string, operation: OpenAPIOperation) {
		if (!this.paths[path]) {
			this.paths[path] = {};
		}
		
		const httpMethod = method.toLowerCase() as keyof OpenAPIPath;
		this.paths[path][httpMethod] = operation;
	}
	
	registerSchema(name: string, schema: z.ZodType<any> | Record<string, any>) {
		if (schema instanceof z.ZodType) {
			this.schemas[name] = zodToOpenAPISchema(schema);
		} else {
			this.schemas[name] = schema;
		}
	}
	
	getPaths(): Record<string, OpenAPIPath> {
		return this.paths;
	}
	
	getSchemas(): Record<string, any> {
		return this.schemas;
	}
}

export const openAPIRegistry = new OpenAPIRegistry();

// Register common schemas
openAPIRegistry.registerSchema('Error', {
	type: 'object',
	properties: {
		statusCode: { type: 'integer' },
		statusMessage: { type: 'string' },
		data: { type: 'object' },
	},
	required: ['statusCode', 'statusMessage'],
});

openAPIRegistry.registerSchema('User', {
	type: 'object',
	properties: {
		id: { type: 'string' },
		email: { type: 'string', format: 'email' },
		username: { type: 'string' },
		emailVerified: { type: 'boolean' },
		createdAt: { type: 'integer' },
		updatedAt: { type: 'integer' },
	},
	required: ['id', 'email', 'username', 'emailVerified'],
});

openAPIRegistry.registerSchema('Team', {
	type: 'object',
	properties: {
		id: { type: 'string' },
		name: { type: 'string' },
		displayName: { type: 'string' },
		description: { type: 'string', nullable: true },
		ownerId: { type: 'string' },
		createdAt: { type: 'integer' },
		updatedAt: { type: 'integer' },
	},
	required: ['id', 'name', 'displayName', 'ownerId', 'createdAt', 'updatedAt'],
});

openAPIRegistry.registerSchema('Rule', {
	type: 'object',
	properties: {
		id: { type: 'string' },
		name: { type: 'string' },
		org: { type: 'string', nullable: true },
		visibility: { type: 'string', enum: ['public', 'private', 'team'] },
		description: { type: 'string', nullable: true },
		tags: { type: 'array', items: { type: 'string' } },
		version: { type: 'string' },
		content: { type: 'string' },
		author: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				username: { type: 'string' },
			},
			required: ['id', 'username'],
		},
		createdAt: { type: 'integer' },
		updatedAt: { type: 'integer' },
	},
	required: ['id', 'name', 'visibility', 'version'],
});

openAPIRegistry.registerSchema('ApiKey', {
	type: 'object',
	properties: {
		id: { type: 'string' },
		name: { type: 'string' },
		key: { type: 'string', description: 'Only returned on creation' },
		scopes: { type: 'array', items: { type: 'string' } },
		expiresAt: { type: 'integer', nullable: true },
		lastUsedAt: { type: 'integer', nullable: true },
		createdAt: { type: 'integer' },
	},
	required: ['id', 'name', 'createdAt'],
});