import { createOpenAPIDocument } from '~/server/utils/openapi';
import { openAPIRegistry } from '~/server/utils/openapi-registry';

export default defineEventHandler(async (event) => {
	// Create the base OpenAPI document
	const doc = createOpenAPIDocument({
		title: 'ZXCV API',
		version: '1.0.0',
		description: 'API for managing coding rules and team collaboration',
	});
	
	// Add all registered paths from the registry
	doc.paths = openAPIRegistry.getPaths();
	
	// Add component schemas
	if (!doc.components) {
		doc.components = {};
	}
	doc.components.schemas = openAPIRegistry.getSchemas();
	
	// Set proper headers for JSON
	setHeader(event, 'Content-Type', 'application/json');
	
	return doc;
});