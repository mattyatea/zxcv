import { defineComponent, ref, watch, computed, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderTeleport, ssrRenderClass, ssrRenderStyle, ssrRenderSlot, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Modal",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean },
    title: {},
    size: { default: "md" },
    showClose: { type: Boolean, default: true },
    preventClose: { type: Boolean, default: false },
    draggable: { type: Boolean, default: false }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const position = ref({ x: 0, y: 0 });
    const isDragging = ref(false);
    ref({ x: 0, y: 0 });
    watch(
      () => props.modelValue,
      (isOpen) => {
        if (isOpen) {
          position.value = { x: 0, y: 0 };
        }
      }
    );
    const modalClasses = computed(() => {
      const base = "modal-panel relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 text-left shadow-2xl";
      const sizes = {
        sm: "sm:w-full sm:max-w-sm",
        md: "sm:w-full sm:max-w-lg",
        lg: "sm:w-full sm:max-w-2xl",
        xl: "sm:w-full sm:max-w-4xl",
        full: "sm:w-full sm:max-w-7xl"
      };
      return [
        base,
        sizes[props.size],
        props.draggable && "cursor-move select-none",
        isDragging.value && "transition-none"
      ].filter(Boolean).join(" ");
    });
    const modalStyle = computed(() => ({
      transform: `translate(${position.value.x}px, ${position.value.y}px)`
    }));
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (_ctx.modelValue) {
          _push2(`<div class="fixed inset-0 z-50 overflow-y-auto" data-v-da0352a9><div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0" data-v-da0352a9><div class="modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm" data-v-da0352a9></div>`);
          if (_ctx.modelValue) {
            _push2(`<div class="${ssrRenderClass(modalClasses.value)}" style="${ssrRenderStyle(modalStyle.value)}" data-v-da0352a9>`);
            if (_ctx.$slots.header || _ctx.title) {
              _push2(`<div class="modal-header" data-v-da0352a9>`);
              ssrRenderSlot(_ctx.$slots, "header", {}, () => {
                _push2(`<h3 class="text-xl font-semibold text-gray-900 dark:text-white" data-v-da0352a9>${ssrInterpolate(_ctx.title)}</h3>`);
              }, _push2, _parent);
              if (_ctx.showClose) {
                _push2(`<button class="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-all duration-200 hover:rotate-90" data-v-da0352a9><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-da0352a9><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-da0352a9></path></svg></button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="modal-body" data-v-da0352a9>`);
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent);
            _push2(`</div>`);
            if (_ctx.$slots.footer) {
              _push2(`<div class="modal-footer" data-v-da0352a9>`);
              ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push2, _parent);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/Modal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-da0352a9"]]);
export {
  __nuxt_component_3 as _
};
//# sourceMappingURL=Modal-DWgkDmQ5.js.map
