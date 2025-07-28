import { _ as _sfc_main$3 } from "./Header-CeSEviV5.js";
import { defineComponent, mergeProps, useSSRContext, unref } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderTeleport, ssrRenderList, ssrRenderClass, ssrRenderComponent, ssrRenderSlot } from "vue/server-renderer";
import { u as useToastStore } from "./toast-DzkE1rsh.js";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "#internal/nuxt/paths";
import { storeToRefs } from "pinia";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./nuxt-link-4uLnvjVp.js";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
import "./Button-BAc5buFc.js";
import "./Modal-DWgkDmQ5.js";
import "./Input-CQRSLkRN.js";
import "./auth-DJ_gFT6B.js";
import "node:http";
import "node:https";
import "node:zlib";
import "node:stream";
import "node:buffer";
import "node:util";
import "node:url";
import "node:net";
import "node:fs";
import "node:path";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "@orpc/client";
import "@orpc/client/fetch";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Footer",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800" }, _attrs))}><div class="container-lg py-12 sm:py-16"><div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"><div class="md:col-span-1"><div class="flex items-center space-x-2 mb-4"><div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center"><span class="text-white font-bold text-lg">Z</span></div><span class="text-2xl font-bold text-gray-900 dark:text-white">zxcv</span></div><p class="text-gray-600 dark:text-gray-400 text-sm">${ssrInterpolate(_ctx.$t("footer.tagline"))}</p><div class="flex items-center space-x-4 mt-6"><a href="#" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"${ssrRenderAttr("aria-label", _ctx.$t("accessibility.socialLinks.twitter"))}><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg></a><a href="#" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"${ssrRenderAttr("aria-label", _ctx.$t("accessibility.socialLinks.github"))}><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg></a><a href="#" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"${ssrRenderAttr("aria-label", _ctx.$t("accessibility.socialLinks.discord"))}><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"></path></svg></a></div></div><div><h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">${ssrInterpolate(_ctx.$t("footer.product"))}</h3><ul class="space-y-3"></ul></div><div><h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">${ssrInterpolate(_ctx.$t("footer.resources"))}</h3><ul class="space-y-3"></ul></div><div><h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">${ssrInterpolate(_ctx.$t("footer.company"))}</h3><ul class="space-y-3"></ul></div></div><div class="pt-8 border-t border-gray-200 dark:border-gray-800"><div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"><div class="text-sm text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("footer.copyright"))}</div><div class="flex items-center space-x-6 text-sm"></div></div></div></div></footer>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/Footer.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Toast",
  __ssrInlineRender: true,
  setup(__props) {
    const toastStore = useToastStore();
    const { toasts } = storeToRefs(toastStore);
    const { removeToast } = toastStore;
    const toastClasses = {
      success: "bg-green-600 text-white",
      error: "bg-red-600 text-white",
      warning: "bg-yellow-500 text-white",
      info: "bg-blue-600 text-white"
    };
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="fixed bottom-4 right-4 z-50 space-y-2" data-v-6cb55900><div${ssrRenderAttrs({ name: "toast" })} data-v-6cb55900>`);
        ssrRenderList(unref(toasts), (toast) => {
          _push2(`<div class="${ssrRenderClass([
            "min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 transition-all",
            toastClasses[toast.type]
          ])}" data-v-6cb55900>`);
          if (toast.type === "success") {
            _push2(`<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" data-v-6cb55900><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-v-6cb55900></path></svg>`);
          } else if (toast.type === "error") {
            _push2(`<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" data-v-6cb55900><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" data-v-6cb55900></path></svg>`);
          } else if (toast.type === "warning") {
            _push2(`<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" data-v-6cb55900><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" data-v-6cb55900></path></svg>`);
          } else {
            _push2(`<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" data-v-6cb55900><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" data-v-6cb55900></path></svg>`);
          }
          _push2(`<div class="flex-1" data-v-6cb55900><p class="text-sm" data-v-6cb55900>${ssrInterpolate(toast.message)}</p></div><button class="text-current opacity-70 hover:opacity-100 transition-opacity" data-v-6cb55900><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-6cb55900><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-6cb55900></path></svg></button></div>`);
        });
        _push2(`</div></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/Toast.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-6cb55900"]]);
const _sfc_main = {
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LayoutHeader = _sfc_main$3;
      const _component_LayoutFooter = _sfc_main$2;
      const _component_CommonToast = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_LayoutHeader, null, null, _parent));
      _push(`<main class="flex-1">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      _push(ssrRenderComponent(_component_LayoutFooter, null, null, _parent));
      _push(ssrRenderComponent(_component_CommonToast, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=default-C1sN2VCE.js.map
