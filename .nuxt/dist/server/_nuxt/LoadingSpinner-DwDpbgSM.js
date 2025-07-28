import { defineComponent, computed, mergeProps, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LoadingSpinner",
  __ssrInlineRender: true,
  props: {
    size: { default: "md" },
    color: { default: "primary" },
    text: {},
    fullscreen: { type: Boolean, default: false },
    overlay: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const containerClasses = computed(() => {
      const base = "flex items-center justify-center";
      if (props.fullscreen) {
        return `${base} fixed inset-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm`;
      }
      if (props.overlay) {
        return `${base} absolute inset-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-[inherit]`;
      }
      return `${base} ${props.text ? "flex-col space-y-2" : ""}`;
    });
    const spinnerClasses = computed(() => {
      const base = "spinner animate-spin";
      const sizes = {
        xs: "w-3 h-3",
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12"
      };
      const colors = {
        primary: "text-primary-500",
        white: "text-white",
        gray: "text-gray-500",
        current: "text-current"
      };
      return [base, sizes[props.size], colors[props.color]].join(" ");
    });
    const textClasses = computed(() => {
      const sizes = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl"
      };
      return [sizes[props.size], "text-gray-600 dark:text-gray-400 font-medium"].join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: containerClasses.value }, _attrs))}><svg class="${ssrRenderClass(spinnerClasses.value)}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
      if (_ctx.text) {
        _push(`<span class="${ssrRenderClass(textClasses.value)}">${ssrInterpolate(_ctx.text)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/LoadingSpinner.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=LoadingSpinner-DwDpbgSM.js.map
