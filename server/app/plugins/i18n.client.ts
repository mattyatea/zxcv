import { useI18n } from "../composables/useI18n";

export default defineNuxtPlugin(() => {
	const { t } = useI18n();

	return {
		provide: {
			t,
		},
	};
});
