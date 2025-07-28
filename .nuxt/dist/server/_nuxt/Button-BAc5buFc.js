import { defineComponent, ref, computed, createVNode, resolveDynamicComponent, mergeProps, withCtx, createBlock, createCommentVNode, openBlock, Transition, renderSlot, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderVNode, ssrRenderStyle, ssrRenderClass, ssrRenderSlot } from "vue/server-renderer";
import { f as useAnimation } from "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Button",
  __ssrInlineRender: true,
  props: {
    variant: { default: "primary" },
    size: { default: "md" },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    fullWidth: { type: Boolean, default: false },
    rounded: { default: "lg" },
    tag: { default: "button" },
    icon: { type: Boolean, default: false },
    shadow: { type: Boolean, default: false },
    pulse: { type: Boolean, default: false },
    glow: { type: Boolean, default: false },
    ripple: { type: Boolean, default: true }
  },
  setup(__props) {
    const props = __props;
    useAnimation();
    const showRipple = ref(false);
    const rippleX = ref(0);
    const rippleY = ref(0);
    const rippleStyle = computed(() => ({
      left: `${rippleX.value}px`,
      top: `${rippleY.value}px`,
      transform: "translate(-50%, -50%)"
    }));
    const handleClick = (event) => {
      if (!props.ripple || props.disabled || props.loading) {
        return;
      }
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      rippleX.value = event.clientX - rect.left;
      rippleY.value = event.clientY - rect.top;
      showRipple.value = true;
      setTimeout(() => {
        showRipple.value = false;
      }, 600);
    };
    const isHovered = ref(false);
    const mouseX = ref(0);
    const mouseY = ref(0);
    const handleMouseMove = (event) => {
      if (!props.glow) {
        return;
      }
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      mouseX.value = (event.clientX - rect.left) / rect.width * 100;
      mouseY.value = (event.clientY - rect.top) / rect.height * 100;
    };
    const handleMouseEnter = (_event) => {
      isHovered.value = true;
    };
    const handleMouseLeave = (_event) => {
      isHovered.value = false;
    };
    const glowStyle = computed(() => {
      if (!props.glow || !isHovered.value) {
        return {};
      }
      return {
        "--mouse-x": `${mouseX.value}%`,
        "--mouse-y": `${mouseY.value}%`
      };
    });
    const buttonClasses = computed(() => {
      const base = "relative inline-flex items-center justify-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu transition-all duration-300 ease-out";
      const variants = {
        primary: "bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm hover:shadow-lg",
        secondary: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500 shadow-sm hover:shadow-lg",
        ghost: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 focus-visible:ring-gray-500",
        outline: "border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 focus-visible:ring-primary-500 hover:border-primary-600",
        danger: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-sm hover:shadow-lg",
        success: "bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500 shadow-sm hover:shadow-lg",
        gradient: "bg-gradient-to-r from-primary-500 to-accent-600 text-white hover:from-primary-600 hover:to-accent-700 focus-visible:ring-primary-500 shadow-sm hover:shadow-lg"
      };
      const sizes = {
        xs: "text-xs px-2.5 py-1.5",
        sm: "text-sm px-3 py-1.5",
        md: "text-sm px-4 py-2",
        lg: "text-base px-6 py-3",
        xl: "text-lg px-8 py-4"
      };
      const roundedStyles = {
        none: "rounded-none",
        sm: "rounded",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full"
      };
      return [
        base,
        variants[props.variant],
        sizes[props.size],
        roundedStyles[props.rounded],
        props.fullWidth && "w-full",
        props.loading && "cursor-wait",
        props.icon && "aspect-square",
        props.shadow && "shadow-lg hover:shadow-2xl transition-shadow duration-300",
        props.pulse && "animate-pulse",
        "group overflow-hidden"
      ].filter(Boolean).join(" ");
    });
    const contentClasses = computed(() => {
      return [
        "flex items-center gap-2 relative z-10",
        props.loading && "opacity-0",
        "transition-opacity duration-200"
      ].filter(Boolean).join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(_ctx.tag), mergeProps({
        class: buttonClasses.value,
        disabled: _ctx.disabled || _ctx.loading
      }, _ctx.$attrs, {
        onClick: handleClick,
        onMouseenter: handleMouseEnter,
        onMouseleave: handleMouseLeave,
        onMousemove: handleMouseMove
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (showRipple.value) {
              _push2(`<span style="${ssrRenderStyle(rippleStyle.value)}" class="absolute rounded-full bg-white/30 dark:bg-white/20 pointer-events-none animate-ripple" data-v-a9bf2c58${_scopeId}></span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(``);
            if (_ctx.loading) {
              _push2(`<span class="absolute inset-0 flex items-center justify-center" data-v-a9bf2c58${_scopeId}><svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-a9bf2c58${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-a9bf2c58${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-a9bf2c58${_scopeId}></path></svg></span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<span class="${ssrRenderClass(contentClasses.value)}" data-v-a9bf2c58${_scopeId}>`);
            ssrRenderSlot(_ctx.$slots, "icon-left", {}, null, _push2, _parent2, _scopeId);
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            ssrRenderSlot(_ctx.$slots, "icon-right", {}, null, _push2, _parent2, _scopeId);
            _push2(`</span>`);
            if (_ctx.glow) {
              _push2(`<span style="${ssrRenderStyle(glowStyle.value)}" class="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none" data-v-a9bf2c58${_scopeId}><span class="${ssrRenderClass([{
                "bg-gradient-radial from-primary-400/30 via-primary-400/10 to-transparent": _ctx.variant === "primary",
                "bg-gradient-radial from-gray-400/20 via-gray-400/5 to-transparent": _ctx.variant === "secondary",
                "bg-gradient-radial from-red-400/30 via-red-400/10 to-transparent": _ctx.variant === "danger",
                "bg-gradient-radial from-green-400/30 via-green-400/10 to-transparent": _ctx.variant === "success"
              }, "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"])}" style="${ssrRenderStyle({
                background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), currentColor 0%, transparent 60%)`,
                opacity: isHovered.value ? 0.3 : 0
              })}" data-v-a9bf2c58${_scopeId}></span></span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              showRipple.value ? (openBlock(), createBlock("span", {
                key: 0,
                style: rippleStyle.value,
                class: "absolute rounded-full bg-white/30 dark:bg-white/20 pointer-events-none animate-ripple"
              }, null, 4)) : createCommentVNode("", true),
              createVNode(Transition, { name: "spinner" }, {
                default: withCtx(() => [
                  _ctx.loading ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "absolute inset-0 flex items-center justify-center"
                  }, [
                    (openBlock(), createBlock("svg", {
                      class: "animate-spin h-5 w-5 text-current",
                      xmlns: "http://www.w3.org/2000/svg",
                      fill: "none",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("circle", {
                        class: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        "stroke-width": "4"
                      }),
                      createVNode("path", {
                        class: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      })
                    ]))
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              createVNode("span", { class: contentClasses.value }, [
                renderSlot(_ctx.$slots, "icon-left", {}, void 0, true),
                renderSlot(_ctx.$slots, "default", {}, void 0, true),
                renderSlot(_ctx.$slots, "icon-right", {}, void 0, true)
              ], 2),
              _ctx.glow ? (openBlock(), createBlock("span", {
                key: 1,
                style: glowStyle.value,
                class: "absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none"
              }, [
                createVNode("span", {
                  class: ["absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", {
                    "bg-gradient-radial from-primary-400/30 via-primary-400/10 to-transparent": _ctx.variant === "primary",
                    "bg-gradient-radial from-gray-400/20 via-gray-400/5 to-transparent": _ctx.variant === "secondary",
                    "bg-gradient-radial from-red-400/30 via-red-400/10 to-transparent": _ctx.variant === "danger",
                    "bg-gradient-radial from-green-400/30 via-green-400/10 to-transparent": _ctx.variant === "success"
                  }],
                  style: {
                    background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), currentColor 0%, transparent 60%)`,
                    opacity: isHovered.value ? 0.3 : 0
                  }
                }, null, 6)
              ], 4)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }), _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/Button.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a9bf2c58"]]);
export {
  __nuxt_component_2 as _
};
//# sourceMappingURL=Button-BAc5buFc.js.map
