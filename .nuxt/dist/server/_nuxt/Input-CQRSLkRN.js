import { defineComponent, useAttrs, useSlots, computed, ref, mergeProps, unref, readonly, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderSlot, ssrGetDynamicModelProps } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Input",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    type: { default: "text" },
    label: {},
    placeholder: {},
    hint: {},
    error: {},
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    variant: { default: "default" },
    size: { default: "md" },
    pattern: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const attrs = useAttrs();
    const slots = useSlots();
    const inputId = computed(
      () => attrs.id || `input-${Math.random().toString(36).substring(2, 11)}`
    );
    const showPassword = ref(false);
    const internalValue = computed({
      get: () => props.modelValue ?? "",
      set: (value) => emit("update:modelValue", value)
    });
    const actualType = computed(() => {
      if (props.type === "password" && showPassword.value) {
        return "text";
      }
      return props.type;
    });
    const showPasswordToggle = computed(() => {
      return props.type === "password" && !props.disabled && !props.readonly;
    });
    const inputClasses = computed(() => {
      const base = "w-full text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 focus:outline-none";
      const variants = {
        default: "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm",
        filled: "bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
        outlined: "bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      };
      const sizes = {
        sm: "px-3 py-1.5 text-sm rounded-md",
        md: "px-4 py-2.5 text-base rounded-lg",
        lg: "px-5 py-3.5 text-lg rounded-xl"
      };
      const states = {
        error: props.error ? "border-danger dark:border-danger focus:border-danger focus:ring-4 focus:ring-danger/10" : "",
        disabled: props.disabled ? "opacity-50 cursor-not-allowed" : "",
        prefix: slots.prefix ? props.size === "sm" ? "pl-9" : props.size === "lg" ? "pl-12" : "pl-10" : "",
        suffix: slots.suffix || props.clearable || showPasswordToggle.value ? props.size === "sm" ? "pr-9" : props.size === "lg" ? "pr-12" : "pr-10" : ""
      };
      return [
        base,
        variants[props.variant],
        sizes[props.size],
        states.error,
        states.disabled,
        states.prefix,
        states.suffix
      ].filter(Boolean).join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      let _temp0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "form-group" }, _attrs))}>`);
      if (_ctx.label) {
        _push(`<label${ssrRenderAttr("for", inputId.value)} class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors duration-200">${ssrInterpolate(_ctx.label)} `);
        if (_ctx.required) {
          _push(`<span class="text-danger ml-0.5">*</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</label>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="relative input-wrapper">`);
      if (_ctx.$slots.prefix) {
        _push(`<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">`);
        ssrRenderSlot(_ctx.$slots, "prefix", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<input${ssrRenderAttrs((_temp0 = mergeProps({
        id: inputId.value,
        type: actualType.value,
        placeholder: _ctx.placeholder,
        disabled: _ctx.disabled,
        readonly: "readonly" in _ctx ? _ctx.readonly : unref(readonly),
        required: _ctx.required,
        pattern: _ctx.pattern,
        class: inputClasses.value
      }, _ctx.$attrs), mergeProps(_temp0, ssrGetDynamicModelProps(_temp0, internalValue.value))))}>`);
      if (_ctx.$slots.suffix || showPasswordToggle.value || _ctx.clearable) {
        _push(`<div class="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">`);
        if (_ctx.clearable && internalValue.value && !_ctx.disabled && !("readonly" in _ctx ? _ctx.readonly : unref(readonly))) {
          _push(`<button type="button" class="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
        } else {
          _push(`<!---->`);
        }
        if (showPasswordToggle.value) {
          _push(`<button type="button" class="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">`);
          if (!showPassword.value) {
            _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`);
          } else {
            _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>`);
          }
          _push(`</button>`);
        } else {
          _push(`<!---->`);
        }
        ssrRenderSlot(_ctx.$slots, "suffix", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (_ctx.hint && !_ctx.error) {
        _push(`<p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">${ssrInterpolate(_ctx.hint)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (_ctx.error) {
        _push(`<p class="text-sm text-danger dark:text-danger mt-1.5 flex items-center gap-1"><svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg> ${ssrInterpolate(_ctx.error)}</p>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/Input.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=Input-CQRSLkRN.js.map
