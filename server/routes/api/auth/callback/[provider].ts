import { eventHandler, getQuery, getRouterParam, sendRedirect } from "h3";

export default eventHandler(async (event) => {
	const provider = getRouterParam(event, "provider");
	const query = getQuery(event);

	// Build query string
	const queryParams = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== null) {
			queryParams.append(key, String(value));
		}
	}

	// Redirect to the Vue page with query parameters
	const redirectUrl = `/auth/callback/${provider}?${queryParams.toString()}`;
	return sendRedirect(event, redirectUrl);
});
