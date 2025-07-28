import { defineComponent, computed, mergeProps, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Select",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    options: {},
    placeholder: {},
    error: {},
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    size: { default: "md" }
  },
  emits: ["update:modelValue", "blur", "focus"],
  setup(__props) {
    const props = __props;
    const id = `select-${Math.random().toString(36).substr(2, 9)}`;
    const selectClasses = computed(() => {
      const base = "w-full bg-white dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 appearance-none pr-10 hover:border-primary-400 dark:hover:border-primary-600 transform-gpu";
      const sizes = {
        sm: "text-sm px-3 py-1.5",
        md: "text-sm px-4 py-2",
        lg: "text-base px-4 py-3"
      };
      const states = {
        normal: "border-gray-200 dark:border-gray-800",
        error: "border-danger focus:border-danger focus:ring-danger",
        disabled: "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-950"
      };
      return [
        base,
        sizes[props.size],
        props.error ? states.error : states.normal,
        props.disabled && states.disabled
      ].filter(Boolean).join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative select-wrapper" }, _attrs))} data-v-9b7836e5><select${ssrRenderAttr("id", id)}${ssrRenderAttr("value", _ctx.modelValue)}${ssrIncludeBooleanAttr(_ctx.disabled) ? " disabled" : ""}${ssrIncludeBooleanAttr(_ctx.required) ? " required" : ""} class="${ssrRenderClass(selectClasses.value)}" data-v-9b7836e5>`);
      if (_ctx.placeholder) {
        _push(`<option value="" disabled data-v-9b7836e5>${ssrInterpolate(_ctx.placeholder)}</option>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(_ctx.options, (option) => {
        _push(`<option${ssrRenderAttr("value", option.value)} data-v-9b7836e5>${ssrInterpolate(option.label)}</option>`);
      });
      _push(`<!--]--></select><div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" data-v-9b7836e5><svg class="select-chevron w-5 h-5 text-gray-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9b7836e5><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-9b7836e5></path></svg></div>`);
      if (_ctx.error) {
        _push(`<p class="error-message" data-v-9b7836e5>${ssrInterpolate(_ctx.error)}</p>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/Select.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9b7836e5"]]);
export {
  __nuxt_component_5 as _
};
//# sourceMappingURL=Select-BXAA3UYM.js.map
