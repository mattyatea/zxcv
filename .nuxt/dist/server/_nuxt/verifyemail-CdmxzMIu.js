import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { a as useNuxtApp, b as useRoute } from "../server.mjs";
import { u as useHead } from "./v3-CdJoEeaK.js";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
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
import "#internal/nuxt/paths";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs";
import "pinia";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "@orpc/client";
import "@orpc/client/fetch";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/@unhead+vue@2.0.12_vue@3.5.17_typescript@5.8.3_/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = {
  __name: "verifyemail",
  __ssrInlineRender: true,
  setup(__props) {
    const { $t } = useNuxtApp();
    useHead({
      title: $t("auth.verifyEmail.pageTitle")
    });
    useRoute();
    const { $rpc } = useNuxtApp();
    const loading = ref(true);
    const success = ref(false);
    const error = ref(false);
    const errorMessage = ref("");
    const resending = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" }, _attrs))} data-v-3d390aed><div class="max-w-md w-full space-y-8" data-v-3d390aed><div class="text-center" data-v-3d390aed><h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white" data-v-3d390aed>${ssrInterpolate(unref($t)("auth.verifyEmail.title"))}</h2><p class="mt-2 text-sm text-gray-600 dark:text-gray-400" data-v-3d390aed>${ssrInterpolate(unref($t)("auth.verifyEmail.verifying"))}</p></div>`);
      if (loading.value) {
        _push(`<div class="flex justify-center" data-v-3d390aed><div class="relative" data-v-3d390aed><div class="absolute inset-0 animate-ping rounded-full h-12 w-12 bg-primary-400 opacity-20" data-v-3d390aed></div><svg class="animate-spin h-10 w-10 text-primary-600 relative" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-3d390aed><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-3d390aed></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-3d390aed></path></svg></div></div>`);
      } else if (success.value) {
        _push(`<div class="rounded-lg bg-green-50 dark:bg-green-900/20 p-6 card-entrance" data-v-3d390aed><div class="flex" data-v-3d390aed><div class="flex-shrink-0" data-v-3d390aed><svg class="h-5 w-5 text-green-400 checkmark-animation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" data-v-3d390aed><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-v-3d390aed></path></svg></div><div class="ml-3" data-v-3d390aed><h3 class="text-sm font-medium text-green-800 dark:text-green-200" data-v-3d390aed>${ssrInterpolate(unref($t)("auth.verifyEmail.success"))}</h3><div class="mt-2 text-sm text-green-700 dark:text-green-300" data-v-3d390aed><p data-v-3d390aed>${ssrInterpolate(unref($t)("auth.verifyEmail.successMessage"))}</p><p class="mt-1" data-v-3d390aed>${ssrInterpolate(unref($t)("auth.verifyEmail.successDescription"))}</p></div><div class="mt-4" data-v-3d390aed>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/auth",
          class: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 button-hover"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref($t)("auth.verifyEmail.goToLogin"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref($t)("auth.verifyEmail.goToLogin")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div></div>`);
      } else if (error.value) {
        _push(`<div class="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 error-shake" data-v-3d390aed><div class="flex" data-v-3d390aed><div class="flex-shrink-0" data-v-3d390aed><svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" data-v-3d390aed><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" data-v-3d390aed></path></svg></div><div class="ml-3" data-v-3d390aed><h3 class="text-sm font-medium text-red-800 dark:text-red-200" data-v-3d390aed>${ssrInterpolate(unref($t)("auth.verifyEmail.error"))}</h3><div class="mt-2 text-sm text-red-700 dark:text-red-300" data-v-3d390aed><p data-v-3d390aed>${ssrInterpolate(errorMessage.value)}</p></div><div class="mt-4 flex space-x-3" data-v-3d390aed>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/register",
          class: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref($t)("auth.verifyEmail.register"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref($t)("auth.verifyEmail.register")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<button${ssrIncludeBooleanAttr(resending.value) ? " disabled" : ""} class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" data-v-3d390aed>${ssrInterpolate(resending.value ? unref($t)("auth.verifyEmail.resending") : unref($t)("auth.verifyEmail.resendEmail"))}</button></div></div></div></div>`);
      } else {
        _push(`<div class="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-6 card-entrance" data-v-3d390aed><div class="flex" data-v-3d390aed><div class="flex-shrink-0" data-v-3d390aed><svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" data-v-3d390aed><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" data-v-3d390aed></path></svg></div><div class="ml-3" data-v-3d390aed><h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200" data-v-3d390aed>${ssrInterpolate(unref($t)("auth.verifyEmail.noToken"))}</h3><div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300" data-v-3d390aed><p data-v-3d390aed>${ssrInterpolate(unref($t)("auth.verifyEmail.noTokenMessage"))}</p><p class="mt-1" data-v-3d390aed>${ssrInterpolate(unref($t)("auth.verifyEmail.noTokenDescription"))}</p></div></div></div></div>`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/verifyemail.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const verifyemail = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3d390aed"]]);
export {
  verifyemail as default
};
//# sourceMappingURL=verifyemail-CdmxzMIu.js.map
