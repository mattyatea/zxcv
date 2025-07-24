export default defineEventHandler(async () => {
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<title>zxcv API Documentation</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
	<div id="swagger-ui"></div>
	<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
	<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
	<script>
		window.onload = () => {
			window.ui = SwaggerUIBundle({
				url: '/api-spec.json',
				dom_id: '#swagger-ui',
				presets: [
					SwaggerUIBundle.presets.apis,
					SwaggerUIStandalonePreset
				],
				layout: 'StandaloneLayout',
				deepLinking: true
			});
		};
	</script>
</body>
</html>
`;

	return new Response(html, {
		headers: {
			"content-type": "text/html",
		},
	});
});
