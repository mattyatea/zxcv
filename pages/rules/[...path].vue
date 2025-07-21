<template>
  <component :is="currentComponent" v-bind="componentProps" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import RuleEditById from "./[id]/edit.vue";
import RuleDetailById from "./[id].vue";

const route = useRoute();
const router = useRouter();

// Parse the path
const pathSegments = computed(() => {
	const path = route.params.path as string[];
	return path || [];
});

// Determine which component to render
const currentComponent = computed(() => {
	const segments = pathSegments.value;

	console.log("Path segments:", segments);

	// If no segments, shouldn't happen
	if (segments.length === 0) {
		return null;
	}

	// Check if it's an ID-based route (UUID format)
	const isUUID = (str: string) =>
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

	// /rules/{id}
	if (segments.length === 1 && isUUID(segments[0])) {
		return RuleDetailById;
	}

	// /rules/{id}/edit
	if (segments.length === 2 && isUUID(segments[0]) && segments[1] === "edit") {
		return RuleEditById;
	}

	// /rules/@owner/name
	if (segments.length === 2 && segments[0].startsWith("@")) {
		// Import and use the detail component
		return defineAsyncComponent(() => import("./@[owner]/[name].vue"));
	}

	// /rules/@owner/name/edit
	if (segments.length === 3 && segments[0].startsWith("@") && segments[2] === "edit") {
		const owner = segments[0].substring(1); // Remove @ prefix
		const name = segments[1];

		// Import and use the edit component
		return defineAsyncComponent(() => import("./@[owner]/[name]/edit.vue"));
	}

	// Unknown route
	throw createError({
		statusCode: 404,
		statusMessage: "Page Not Found",
	});
});

// Props to pass to the component
const componentProps = computed(() => {
	const segments = pathSegments.value;

	// For ID-based routes
	if (
		segments.length >= 1 &&
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segments[0])
	) {
		return {
			id: segments[0],
		};
	}

	// For @owner/name routes
	if (segments.length >= 2 && segments[0].startsWith("@")) {
		return {
			owner: segments[0].substring(1),
			name: segments[1],
		};
	}

	return {};
});

// Provide route params for child components
provide("customRouteParams", componentProps.value);
</script>