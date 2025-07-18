import type { EventHandler, H3Event } from 'h3';
import { z } from 'zod';

export interface OpenAPIOperation {
	operationId?: string;
	summary?: string;
	description?: string;
	tags?: string[];
	security?: Array<Record<string, string[]>>;
	parameters?: OpenAPIParameter[];
	requestBody?: OpenAPIRequestBody;
	responses: Record<string, OpenAPIResponse>;
	deprecated?: boolean;
}

export interface OpenAPIParameter {
	name: string;
	in: 'query' | 'header' | 'path' | 'cookie';
	description?: string;
	required?: boolean;
	deprecated?: boolean;
	schema: Record<string, any>;
}

export interface OpenAPIRequestBody {
	description?: string;
	required?: boolean;
	content: {
		'application/json': {
			schema: Record<string, any>;
		};
	};
}

export interface OpenAPIResponse {
	description: string;
	content?: {
		'application/json': {
			schema: Record<string, any>;
		};
	};
}

export interface OpenAPIPath {
	get?: OpenAPIOperation;
	post?: OpenAPIOperation;
	put?: OpenAPIOperation;
	patch?: OpenAPIOperation;
	delete?: OpenAPIOperation;
	options?: OpenAPIOperation;
	head?: OpenAPIOperation;
}

export interface OpenAPISchema {
	openapi: '3.0.0' | '3.0.1' | '3.0.2' | '3.0.3' | '3.1.0';
	info: {
		title: string;
		version: string;
		description?: string;
		termsOfService?: string;
		contact?: {
			name?: string;
			url?: string;
			email?: string;
		};
		license?: {
			name: string;
			url?: string;
		};
	};
	servers?: Array<{
		url: string;
		description?: string;
		variables?: Record<string, {
			default: string;
			description?: string;
			enum?: string[];
		}>;
	}>;
	paths: Record<string, OpenAPIPath>;
	components?: {
		schemas?: Record<string, any>;
		securitySchemes?: Record<string, any>;
		parameters?: Record<string, OpenAPIParameter>;
		responses?: Record<string, OpenAPIResponse>;
	};
	security?: Array<Record<string, string[]>>;
	tags?: Array<{
		name: string;
		description?: string;
		externalDocs?: {
			description?: string;
			url: string;
		};
	}>;
}

// Store for OpenAPI metadata
const openAPIMetadata = new Map<string, OpenAPIOperation>();

// Helper to convert Zod schema to OpenAPI JSON Schema
export function zodToOpenAPISchema(schema: z.ZodType<any>): Record<string, any> {
	// This is a simplified version - in production, use @asteasolutions/zod-to-openapi
	if (schema instanceof z.ZodString) {
		return { type: 'string' };
	} else if (schema instanceof z.ZodNumber) {
		return { type: 'number' };
	} else if (schema instanceof z.ZodBoolean) {
		return { type: 'boolean' };
	} else if (schema instanceof z.ZodArray) {
		return {
			type: 'array',
			items: zodToOpenAPISchema(schema._def.type),
		};
	} else if (schema instanceof z.ZodObject) {
		const shape = schema._def.shape();
		const properties: Record<string, any> = {};
		const required: string[] = [];
		
		for (const [key, value] of Object.entries(shape)) {
			properties[key] = zodToOpenAPISchema(value as z.ZodType<any>);
			if (!(value as any).isOptional()) {
				required.push(key);
			}
		}
		
		return {
			type: 'object',
			properties,
			required: required.length > 0 ? required : undefined,
		};
	} else if (schema instanceof z.ZodEnum) {
		return {
			type: 'string',
			enum: schema._def.values,
		};
	} else if (schema instanceof z.ZodOptional) {
		return zodToOpenAPISchema(schema._def.innerType);
	} else if (schema instanceof z.ZodNullable) {
		const innerSchema = zodToOpenAPISchema(schema._def.innerType);
		return {
			...innerSchema,
			nullable: true,
		};
	} else if (schema instanceof z.ZodDefault) {
		const innerSchema = zodToOpenAPISchema(schema._def.innerType);
		return {
			...innerSchema,
			default: schema._def.defaultValue(),
		};
	}
	
	// Fallback
	return { type: 'object' };
}

// Helper to define an event handler with OpenAPI metadata
export function defineOpenAPIEventHandler<T extends EventHandler>(
	operation: OpenAPIOperation,
	handler: T
): T {
	// Store metadata associated with the handler
	const wrappedHandler = (async (event: H3Event) => {
		// Store OpenAPI metadata on the event for later retrieval
		(event as any).__openapi__ = operation;
		return await handler(event);
	}) as T;
	
	// Store in our registry with a unique key
	const handlerKey = `${operation.operationId || Math.random().toString(36).substring(7)}`;
	openAPIMetadata.set(handlerKey, operation);
	(wrappedHandler as any).__openapi_key__ = handlerKey;
	
	return wrappedHandler;
}

// Helper to get all OpenAPI metadata
export function getAllOpenAPIMetadata(): Map<string, OpenAPIOperation> {
	return openAPIMetadata;
}

// Helper to generate OpenAPI paths from Nitro routes
export async function generateOpenAPIPaths(): Promise<Record<string, OpenAPIPath>> {
	const paths: Record<string, OpenAPIPath> = {};
	
	// This would need to be implemented to scan all API routes
	// For now, we'll need to manually register them
	
	return paths;
}

// Helper to create a complete OpenAPI document
export function createOpenAPIDocument(config: {
	title: string;
	version: string;
	description?: string;
}): OpenAPISchema {
	return {
		openapi: '3.0.3',
		info: {
			title: config.title,
			version: config.version,
			description: config.description,
		},
		servers: [
			{
				url: '/api',
				description: 'API Server',
			},
		],
		paths: {},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
				apiKey: {
					type: 'apiKey',
					in: 'header',
					name: 'X-API-Key',
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
		tags: [
			{
				name: 'Auth',
				description: 'Authentication endpoints',
			},
			{
				name: 'Users',
				description: 'User management endpoints',
			},
			{
				name: 'Teams',
				description: 'Team management endpoints',
			},
			{
				name: 'Rules',
				description: 'Rule management endpoints',
			},
			{
				name: 'API Keys',
				description: 'API key management endpoints',
			},
		],
	};
}