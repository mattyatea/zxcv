/**
 * Animation composable for managing animations in the application
 */

import { computed, onMounted, ref } from "vue";

export interface AnimationOptions {
	duration?: number;
	delay?: number;
	easing?: string;
	fill?: "none" | "forwards" | "backwards" | "both";
	iterations?: number;
}

export interface ScrollAnimationOptions extends AnimationOptions {
	threshold?: number;
	rootMargin?: string;
	once?: boolean;
}

/**
 * Custom animation timing functions
 */
export const easings = {
	easeOutExpo: "cubic-bezier(0.19, 1, 0.22, 1)",
	easeOutQuart: "cubic-bezier(0.25, 1, 0.5, 1)",
	easeOutBack: "cubic-bezier(0.34, 1.56, 0.64, 1)",
	easeInOutQuart: "cubic-bezier(0.76, 0, 0.24, 1)",
	easeSpring: "cubic-bezier(0.43, 0.195, 0.02, 1.3)",
	easeBounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

/**
 * Animation durations
 */
export const durations = {
	instant: 100,
	fast: 200,
	normal: 300,
	slow: 500,
	slower: 800,
	slowest: 1200,
} as const;

/**
 * Main animation composable
 */
export const useAnimation = () => {
	const isAnimating = ref(false);
	const animationProgress = ref(0);

	/**
	 * Animate an element with a specific animation class
	 */
	const animate = async (
		element: HTMLElement | null,
		animationClass: string,
		options: AnimationOptions = {},
	) => {
		if (!element) {
			return;
		}

		const {
			duration = durations.normal,
			delay = 0,
			easing = easings.easeOutQuart,
			fill = "both",
			iterations = 1,
		} = options;

		// Remove any existing animation classes
		element.classList.forEach((className) => {
			if (className.startsWith("animate-")) {
				element.classList.remove(className);
			}
		});

		// Set animation properties
		element.style.animationDuration = `${duration}ms`;
		element.style.animationDelay = `${delay}ms`;
		element.style.animationTimingFunction = easing;
		element.style.animationFillMode = fill;
		element.style.animationIterationCount = iterations.toString();

		// Add animation class
		element.classList.add(animationClass);
		isAnimating.value = true;

		// Wait for animation to complete
		return new Promise<void>((resolve) => {
			const handleAnimationEnd = () => {
				element.removeEventListener("animationend", handleAnimationEnd);
				isAnimating.value = false;
				resolve();
			};

			element.addEventListener("animationend", handleAnimationEnd);
		});
	};

	/**
	 * Create a staggered animation for multiple elements
	 */
	const animateStagger = async (
		elements: NodeListOf<Element> | HTMLElement[],
		animationClass: string,
		options: AnimationOptions & { staggerDelay?: number } = {},
	) => {
		const { staggerDelay = 50, ...animationOptions } = options;

		const promises = Array.from(elements).map((element, index) =>
			animate(element as HTMLElement, animationClass, {
				...animationOptions,
				delay: (animationOptions.delay || 0) + index * staggerDelay,
			}),
		);

		await Promise.all(promises);
	};

	/**
	 * Animate on scroll using Intersection Observer
	 */
	const animateOnScroll = (
		element: HTMLElement | null,
		animationClass: string,
		options: ScrollAnimationOptions = {},
	) => {
		if (!element) {
			return;
		}

		const { threshold = 0.1, rootMargin = "0px", once = true, ...animationOptions } = options;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						animate(entry.target as HTMLElement, animationClass, animationOptions);
						if (once) {
							observer.unobserve(entry.target);
						}
					}
				});
			},
			{
				threshold,
				rootMargin,
			},
		);

		observer.observe(element);

		// Return cleanup function
		return () => {
			observer.disconnect();
		};
	};

	/**
	 * Create a timeline animation sequence
	 */
	const createTimeline = () => {
		const timeline: Array<{
			element: HTMLElement;
			animation: string;
			options: AnimationOptions;
		}> = [];

		const add = (element: HTMLElement, animation: string, options: AnimationOptions = {}) => {
			timeline.push({ element, animation, options });
			return { add, play };
		};

		const play = async () => {
			for (const step of timeline) {
				await animate(step.element, step.animation, step.options);
			}
		};

		return { add, play };
	};

	/**
	 * Spring physics animation
	 */
	const spring = (
		element: HTMLElement | null,
		property: string,
		to: number,
		options: {
			from?: number;
			stiffness?: number;
			damping?: number;
			mass?: number;
		} = {},
	) => {
		if (!element) {
			return;
		}

		const { from = 0, stiffness = 100, damping = 10, mass = 1 } = options;

		let value = from;
		let velocity = 0;
		let animationId: number;

		const animate = () => {
			const force = (to - value) * stiffness;
			const damper = velocity * damping;
			const acceleration = (force - damper) / mass;

			velocity += acceleration * 0.016; // 60fps
			value += velocity * 0.016;

			// Apply value to element
			if (property === "translateX" || property === "translateY") {
				element.style.transform = `${property}(${value}px)`;
			} else {
				(element.style as any)[property] = `${value}px`;
			}

			// Continue animation if not settled
			if (Math.abs(velocity) > 0.01 || Math.abs(to - value) > 0.01) {
				animationId = requestAnimationFrame(animate);
			}
		};

		animate();

		// Return cleanup function
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	};

	/**
	 * Parallax effect on scroll
	 */
	const parallax = (element: HTMLElement | null, speed = 0.5, offset = 0) => {
		if (!element) {
			return;
		}

		const handleScroll = () => {
			const scrolled = window.scrollY;
			const yPos = -(scrolled * speed) + offset;
			element.style.transform = `translateY(${yPos}px)`;
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll(); // Initial position

		// Return cleanup function
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	};

	/**
	 * Mouse parallax effect
	 */
	const mouseParallax = (element: HTMLElement | null, sensitivity = 0.1) => {
		if (!element) {
			return;
		}

		const handleMouseMove = (e: MouseEvent) => {
			const { clientX, clientY } = e;
			const { innerWidth, innerHeight } = window;

			const x = (clientX - innerWidth / 2) * sensitivity;
			const y = (clientY - innerHeight / 2) * sensitivity;

			element.style.transform = `translate(${x}px, ${y}px)`;
		};

		window.addEventListener("mousemove", handleMouseMove);

		// Return cleanup function
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	};

	/**
	 * Morph between two shapes
	 *
	 * NOTE: The Web Animations API doesn't natively support morphing the 'd' attribute.
	 * This implementation may not work in all browsers. For production use, consider
	 * using libraries like GSAP or implementing a custom path interpolation solution.
	 *
	 * @experimental This feature is experimental and may not work as expected
	 */
	const morph = (
		element: HTMLElement | null,
		fromPath: string,
		toPath: string,
		duration: number = durations.normal,
	) => {
		if (!element || !(element instanceof SVGPathElement)) {
			return;
		}

		// Warning: Direct 'd' attribute animation may not be supported
		// Consider using a more robust solution for path morphing
		const animation = element.animate([{ d: fromPath }, { d: toPath }], {
			duration,
			easing: easings.easeOutQuart,
			fill: "forwards",
		});

		return animation;
	};

	/**
	 * Count up animation
	 */
	const countUp = (
		element: HTMLElement | null,
		start: number,
		end: number,
		duration: number = durations.slower,
		decimals = 0,
	) => {
		if (!element) {
			return;
		}

		const startTime = Date.now();
		const range = end - start;

		const update = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			const value = start + range * progress;
			element.textContent = value.toFixed(decimals);

			if (progress < 1) {
				requestAnimationFrame(update);
			}
		};

		update();
	};

	return {
		isAnimating,
		animationProgress,
		animate,
		animateStagger,
		animateOnScroll,
		createTimeline,
		spring,
		parallax,
		mouseParallax,
		morph,
		countUp,
		easings,
		durations,
	};
};

/**
 * Page transition composable
 */
export const usePageTransition = () => {
	const transitionName = ref("page");
	const transitionMode = ref<"in-out" | "out-in">("out-in");

	const setTransition = (name: string, mode: "in-out" | "out-in" = "out-in") => {
		transitionName.value = name;
		transitionMode.value = mode;
	};

	return {
		transitionName: computed(() => transitionName.value),
		transitionMode: computed(() => transitionMode.value),
		setTransition,
	};
};

/**
 * View transitions API composable (for browsers that support it)
 */
export const useViewTransition = () => {
	const isSupported = ref(false);

	// Check support only on client side
	onMounted(() => {
		isSupported.value = typeof document !== "undefined" && "startViewTransition" in document;
	});

	const startTransition = async (callback: () => void | Promise<void>) => {
		if (
			typeof document === "undefined" ||
			!isSupported.value ||
			!(document as any).startViewTransition
		) {
			await callback();
			return;
		}

		const transition = (document as any).startViewTransition(async () => {
			await callback();
		});

		return transition;
	};

	return {
		isSupported: computed(() => isSupported.value),
		startTransition,
	};
};
