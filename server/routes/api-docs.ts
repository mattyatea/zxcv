export default defineEventHandler(async () => {
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<title>zxcv API Documentation</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
	<script id="api-reference" data-url="/api-spec.json"></script>
	<script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
`;

	return new Response(html, {
		headers: {
			"content-type": "text/html",
		},
	});
});
