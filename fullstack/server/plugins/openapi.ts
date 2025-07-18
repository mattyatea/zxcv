import { openAPIRegistry } from '~/server/utils/openapi-registry';

// Auto-register all API routes with OpenAPI definitions
export default defineNitroPlugin((nitroApp) => {
	// Register all auth endpoints
	// Auth endpoints
	openAPIRegistry.registerPath('/auth/login', 'POST', {
		operationId: 'login',
		summary: 'User login',
		tags: ['Auth'],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							email: { type: 'string', format: 'email' },
							password: { type: 'string' },
						},
						required: ['email', 'password'],
					},
				},
			},
		},
		responses: {
			'200': {
				description: 'Login successful',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								user: { $ref: '#/components/schemas/User' },
								token: { type: 'string' },
							},
							required: ['user', 'token'],
						},
					},
				},
			},
			'401': { description: 'Invalid credentials' },
		},
	});

	openAPIRegistry.registerPath('/auth/register', 'POST', {
		operationId: 'register',
		summary: 'User registration',
		tags: ['Auth'],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							email: { type: 'string', format: 'email' },
							username: { type: 'string' },
							password: { type: 'string', minLength: 8 },
						},
						required: ['email', 'username', 'password'],
					},
				},
			},
		},
		responses: {
			'201': {
				description: 'Registration successful',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								user: { $ref: '#/components/schemas/User' },
								message: { type: 'string' },
							},
							required: ['user', 'message'],
						},
					},
				},
			},
			'409': { description: 'Email or username already exists' },
		},
	});

	openAPIRegistry.registerPath('/auth/logout', 'POST', {
		operationId: 'logout',
		summary: 'User logout',
		tags: ['Auth'],
		security: [{ bearerAuth: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							refreshToken: { type: 'string' },
						},
						required: ['refreshToken'],
					},
				},
			},
		},
		responses: {
			'200': { description: 'Logout successful' },
		},
	});

	openAPIRegistry.registerPath('/auth/refresh', 'POST', {
		operationId: 'refreshToken',
		summary: 'Refresh access token',
		tags: ['Auth'],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							refreshToken: { type: 'string' },
						},
						required: ['refreshToken'],
					},
				},
			},
		},
		responses: {
			'200': {
				description: 'Token refreshed',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								token: { type: 'string' },
								refreshToken: { type: 'string' },
							},
							required: ['token', 'refreshToken'],
						},
					},
				},
			},
			'401': { description: 'Invalid refresh token' },
		},
	});

	// Rules endpoints
	openAPIRegistry.registerPath('/rules', 'POST', {
		operationId: 'createRule',
		summary: 'Create a new rule',
		tags: ['Rules'],
		security: [{ bearerAuth: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							name: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$' },
							org: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$' },
							visibility: { type: 'string', enum: ['public', 'private', 'team'] },
							description: { type: 'string', maxLength: 500 },
							tags: { type: 'array', items: { type: 'string' } },
							content: { type: 'string' },
							teamId: { type: 'string' },
						},
						required: ['name', 'content'],
					},
				},
			},
		},
		responses: {
			'201': {
				description: 'Rule created',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Rule' },
					},
				},
			},
		},
	});

	openAPIRegistry.registerPath('/rules/search', 'GET', {
		operationId: 'searchRules',
		summary: 'Search rules',
		tags: ['Rules'],
		parameters: [
			{
				name: 'q',
				in: 'query',
				description: 'Search query',
				schema: { type: 'string' },
			},
			{
				name: 'visibility',
				in: 'query',
				description: 'Filter by visibility',
				schema: { type: 'string', enum: ['public', 'private', 'team'] },
			},
			{
				name: 'tags',
				in: 'query',
				description: 'Filter by tags (comma-separated)',
				schema: { type: 'string' },
			},
			{
				name: 'org',
				in: 'query',
				description: 'Filter by organization',
				schema: { type: 'string' },
			},
			{
				name: 'limit',
				in: 'query',
				schema: { type: 'string', default: '20' },
			},
			{
				name: 'offset',
				in: 'query',
				schema: { type: 'string', default: '0' },
			},
		],
		responses: {
			'200': {
				description: 'Search results',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								results: {
									type: 'array',
									items: { $ref: '#/components/schemas/Rule' },
								},
								total: { type: 'integer' },
								limit: { type: 'integer' },
								offset: { type: 'integer' },
							},
						},
					},
				},
			},
		},
	});

	openAPIRegistry.registerPath('/rules/{id}', 'GET', {
		operationId: 'getRule',
		summary: 'Get a rule by ID',
		tags: ['Rules'],
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				schema: { type: 'string' },
			},
			{
				name: 'version',
				in: 'query',
				description: 'Specific version to retrieve',
				schema: { type: 'string' },
			},
		],
		responses: {
			'200': {
				description: 'Rule details',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Rule' },
					},
				},
			},
			'404': { description: 'Rule not found' },
		},
	});

	openAPIRegistry.registerPath('/rules/{id}', 'PUT', {
		operationId: 'updateRule',
		summary: 'Update a rule',
		tags: ['Rules'],
		security: [{ bearerAuth: [] }],
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				schema: { type: 'string' },
			},
		],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							description: { type: 'string' },
							tags: { type: 'array', items: { type: 'string' } },
							content: { type: 'string' },
							changelog: { type: 'string' },
						},
					},
				},
			},
		},
		responses: {
			'200': { description: 'Rule updated' },
			'401': { description: 'Unauthorized' },
			'404': { description: 'Rule not found' },
		},
	});

	openAPIRegistry.registerPath('/rules/{id}', 'DELETE', {
		operationId: 'deleteRule',
		summary: 'Delete a rule',
		tags: ['Rules'],
		security: [{ bearerAuth: [] }],
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				schema: { type: 'string' },
			},
		],
		responses: {
			'204': { description: 'Rule deleted' },
			'401': { description: 'Unauthorized' },
			'404': { description: 'Rule not found' },
		},
	});

	// API Keys endpoints
	openAPIRegistry.registerPath('/api-keys', 'GET', {
		operationId: 'getApiKeys',
		summary: 'List API keys',
		tags: ['API Keys'],
		security: [{ bearerAuth: [] }],
		parameters: [
			{
				name: 'limit',
				in: 'query',
				schema: { type: 'string', default: '20' },
			},
			{
				name: 'offset',
				in: 'query',
				schema: { type: 'string', default: '0' },
			},
		],
		responses: {
			'200': {
				description: 'API keys list',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								results: {
									type: 'array',
									items: { $ref: '#/components/schemas/ApiKey' },
								},
								total: { type: 'integer' },
								limit: { type: 'integer' },
								offset: { type: 'integer' },
							},
						},
					},
				},
			},
		},
	});

	openAPIRegistry.registerPath('/api-keys', 'POST', {
		operationId: 'createApiKey',
		summary: 'Create API key',
		tags: ['API Keys'],
		security: [{ bearerAuth: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							scopes: {
								type: 'array',
								items: {
									type: 'string',
									enum: [
										'rules:read',
										'rules:write',
										'teams:read',
										'teams:write',
										'users:read',
										'users:write',
										'api_keys:read',
										'api_keys:write',
									],
								},
							},
							expires_at: { type: 'integer' },
						},
						required: ['name'],
					},
				},
			},
		},
		responses: {
			'201': {
				description: 'API key created',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ApiKey' },
					},
				},
			},
		},
	});

	// Users endpoints
	openAPIRegistry.registerPath('/users/profile', 'GET', {
		operationId: 'getUserProfile',
		summary: 'Get user profile',
		tags: ['Users'],
		security: [{ bearerAuth: [] }],
		responses: {
			'200': {
				description: 'User profile',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/User' },
					},
				},
			},
		},
	});

	openAPIRegistry.registerPath('/users/profile', 'PUT', {
		operationId: 'updateUserProfile',
		summary: 'Update user profile',
		tags: ['Users'],
		security: [{ bearerAuth: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							email: { type: 'string', format: 'email' },
							username: { type: 'string' },
						},
					},
				},
			},
		},
		responses: {
			'200': { description: 'Profile updated' },
			'409': { description: 'Email or username already taken' },
		},
	});

	console.log('OpenAPI routes registered');
});