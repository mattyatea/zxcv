import { defineComponent, ref, computed, createVNode, resolveDynamicComponent, mergeProps, withCtx, createBlock, createCommentVNode, openBlock, renderSlot, toDisplayString, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderVNode, ssrRenderClass, ssrRenderSlot, ssrInterpolate } from "vue/server-renderer";
import { f as useAnimation } from "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Card",
  __ssrInlineRender: true,
  props: {
    title: {},
    variant: { default: "default" },
    padding: { default: "md" },
    rounded: { default: "xl" },
    clickable: { type: Boolean, default: false },
    hover: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    animationDelay: { default: 0 },
    animate: { type: Boolean, default: true },
    animateOnScroll: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const cardRef = ref();
    useAnimation();
    const handleMouseEnter = () => {
      if (!props.hover && !props.clickable) {
        return;
      }
      if (cardRef.value) {
        cardRef.value.style.transform = "translateY(-2px)";
      }
    };
    const handleMouseLeave = () => {
      if (!props.hover && !props.clickable) {
        return;
      }
      if (cardRef.value) {
        cardRef.value.style.transform = "translateY(0)";
      }
    };
    const cardClasses = computed(() => {
      const base = "card relative block w-full transition-all duration-300 group transform-gpu";
      const variants = {
        default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md",
        bordered: "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800",
        elevated: "bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl",
        flat: "bg-gray-100 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750",
        glass: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl"
      };
      const paddings = {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10"
      };
      const roundedStyles = {
        none: "rounded-none",
        sm: "rounded",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl"
      };
      const interactive = props.clickable ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 click-scale" : "";
      const hoverEffect = props.hover || props.clickable ? "hover-lift" : "";
      return [
        base,
        variants[props.variant],
        paddings[props.padding],
        roundedStyles[props.rounded],
        interactive,
        hoverEffect,
        props.loading && "animate-pulse"
      ].filter(Boolean).join(" ");
    });
    const headerClasses = computed(() => {
      const paddingMap = {
        none: "",
        sm: "-m-4 mb-4 p-4",
        md: "-m-6 mb-6 p-6",
        lg: "-m-8 mb-8 p-8",
        xl: "-m-10 mb-10 p-10"
      };
      return [
        "card-header border-b border-gray-200 dark:border-gray-800",
        props.padding !== "none" && paddingMap[props.padding]
      ].filter(Boolean).join(" ");
    });
    const footerClasses = computed(() => {
      const paddingMap = {
        none: "",
        sm: "-m-4 mt-4 p-4",
        md: "-m-6 mt-6 p-6",
        lg: "-m-8 mt-8 p-8",
        xl: "-m-10 mt-10 p-10"
      };
      return [
        "card-footer border-t border-gray-200 dark:border-gray-800",
        props.padding !== "none" && paddingMap[props.padding]
      ].filter(Boolean).join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(_ctx.clickable ? "button" : "div"), mergeProps({
        ref_key: "cardRef",
        ref: cardRef,
        class: cardClasses.value
      }, _ctx.$attrs, {
        onMouseenter: handleMouseEnter,
        onMouseleave: handleMouseLeave
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (_ctx.hover || _ctx.clickable) {
              _push2(`<div class="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" data-v-81ced111${_scopeId}></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="relative z-10" data-v-81ced111${_scopeId}>`);
            if (_ctx.$slots.header || _ctx.title) {
              _push2(`<div class="${ssrRenderClass(headerClasses.value)}" data-v-81ced111${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "header", {}, () => {
                if (_ctx.title) {
                  _push2(`<h3 class="heading-4" data-v-81ced111${_scopeId}>${ssrInterpolate(_ctx.title)}</h3>`);
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="card-body" data-v-81ced111${_scopeId}>`);
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            _push2(`</div>`);
            if (_ctx.$slots.footer) {
              _push2(`<div class="${ssrRenderClass(footerClasses.value)}" data-v-81ced111${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (_ctx.loading) {
              _push2(`<div class="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none" data-v-81ced111${_scopeId}><div class="skeleton-loading w-full h-full" data-v-81ced111${_scopeId}></div></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              _ctx.hover || _ctx.clickable ? (openBlock(), createBlock("div", {
                key: 0,
                class: "absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              })) : createCommentVNode("", true),
              createVNode("div", { class: "relative z-10" }, [
                _ctx.$slots.header || _ctx.title ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: headerClasses.value
                }, [
                  renderSlot(_ctx.$slots, "header", {}, () => [
                    _ctx.title ? (openBlock(), createBlock("h3", {
                      key: 0,
                      class: "heading-4"
                    }, toDisplayString(_ctx.title), 1)) : createCommentVNode("", true)
                  ], true)
                ], 2)) : createCommentVNode("", true),
                createVNode("div", { class: "card-body" }, [
                  renderSlot(_ctx.$slots, "default", {}, void 0, true)
                ]),
                _ctx.$slots.footer ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: footerClasses.value
                }, [
                  renderSlot(_ctx.$slots, "footer", {}, void 0, true)
                ], 2)) : createCommentVNode("", true)
              ]),
              _ctx.loading ? (openBlock(), createBlock("div", {
                key: 1,
                class: "absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none"
              }, [
                createVNode("div", { class: "skeleton-loading w-full h-full" })
              ])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/Card.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-81ced111"]]);
export {
  __nuxt_component_2 as _
};
//# sourceMappingURL=Card-gEDzb8hb.js.map
