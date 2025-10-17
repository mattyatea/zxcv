export default defineEventHandler(async (event) => {
	const path = getRouterParam(event, "path");

	if (!path) {
		throw createError({
			statusCode: 404,
			statusMessage: "Avatar not found",
		});
	}

	// Get R2 binding from Nitro/Cloudflare context
	const env = event.context.cloudflare?.env;
	const r2 = env?.R2 as R2Bucket | undefined;

	if (!r2) {
		// In development mode without Cloudflare bindings, return placeholder
		throw createError({
			statusCode: 404,
			statusMessage:
				"Avatar not found - use 'pnpm preview' to test with R2 storage",
		});
	}

	try {
		// Get avatar from R2 storage
		const avatarKey = `avatars/${path}`;
		const object = await r2.get(avatarKey);

		if (!object) {
			throw createError({
				statusCode: 404,
				statusMessage: "Avatar not found",
			});
		}

		// Get file extension for content type
		const ext = path.split(".").pop()?.toLowerCase() || "png";
		const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;

		// Set headers for image response
		setHeader(event, "Content-Type", contentType);
		setHeader(event, "Cache-Control", "public, max-age=86400"); // Cache for 24 hours
		setHeader(event, "ETag", object.etag || "");

		// Convert R2 object to array buffer
		const arrayBuffer = await object.arrayBuffer();

		return new Uint8Array(arrayBuffer);
	} catch (error) {
		console.error("Avatar fetch error:", error);
		throw createError({
			statusCode: 404,
			statusMessage: "Avatar not found",
		});
	}
});
