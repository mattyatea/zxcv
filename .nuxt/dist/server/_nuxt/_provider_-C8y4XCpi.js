import { _ as __nuxt_component_2 } from "./Card-gEDzb8hb.js";
import { _ as _sfc_main$1 } from "./LoadingSpinner-DwDpbgSM.js";
import { _ as __nuxt_component_2$1 } from "./Button-BAc5buFc.js";
import { b as useRoute, c as useRouter, a as useNuxtApp, n as navigateTo } from "../server.mjs";
import { defineComponent, computed, ref, mergeProps, withCtx, unref, createTextVNode, createBlock, createCommentVNode, openBlock, createVNode, toDisplayString, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import { u as useToast } from "./useToast-CcSWCLuS.js";
import { u as useAuthStore } from "./auth-DJ_gFT6B.js";
import { u as useHead } from "./v3-CdJoEeaK.js";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
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
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
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
import "./toast-DzkE1rsh.js";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/@unhead+vue@2.0.12_vue@3.5.17_typescript@5.8.3_/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[provider]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const { $rpc } = useNuxtApp();
    useAuthStore();
    const { success: toastSuccess, error: toastError } = useToast();
    const provider = computed(() => route.params.provider);
    const providerName = computed(() => {
      const providers = {
        google: "Google",
        github: "GitHub"
      };
      return providers[provider.value] || provider.value;
    });
    const loading = ref(true);
    const error = ref(null);
    const success = ref(false);
    const isRegistering = ref(false);
    const retry = () => {
      navigateTo(`/auth?provider=${provider.value}`);
    };
    useHead({
      title: `${providerName.value}認証 - ZXCV`,
      meta: [{ name: "robots", content: "noindex,nofollow" }]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CommonCard = __nuxt_component_2;
      const _component_CommonLoadingSpinner = _sfc_main$1;
      const _component_CommonButton = __nuxt_component_2$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" }, _attrs))} data-v-bd9f73ff><div class="max-w-md w-full px-4" data-v-bd9f73ff>`);
      _push(ssrRenderComponent(_component_CommonCard, {
        padding: "lg",
        class: "text-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(loading)) {
              _push2(`<div class="space-y-4" data-v-bd9f73ff${_scopeId}>`);
              _push2(ssrRenderComponent(_component_CommonLoadingSpinner, {
                size: "lg",
                class: "mx-auto"
              }, null, _parent2, _scopeId));
              _push2(`<h2 class="text-xl font-semibold text-gray-900 dark:text-white" data-v-bd9f73ff${_scopeId}> 認証処理中... </h2><p class="text-gray-600 dark:text-gray-400" data-v-bd9f73ff${_scopeId}>${ssrInterpolate(unref(providerName))}アカウントで${ssrInterpolate(unref(isRegistering) ? "アカウントを作成" : "ログイン")}しています </p></div>`);
            } else if (unref(error)) {
              _push2(`<div class="space-y-4" data-v-bd9f73ff${_scopeId}><div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto" data-v-bd9f73ff${_scopeId}><svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-bd9f73ff${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-bd9f73ff${_scopeId}></path></svg></div><h2 class="text-xl font-semibold text-gray-900 dark:text-white" data-v-bd9f73ff${_scopeId}> 認証エラー </h2><p class="text-gray-600 dark:text-gray-400" data-v-bd9f73ff${_scopeId}>${ssrInterpolate(unref(error))}</p><div class="flex flex-col sm:flex-row gap-3 justify-center mt-6" data-v-bd9f73ff${_scopeId}>`);
              _push2(ssrRenderComponent(_component_CommonButton, {
                variant: "primary",
                onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/auth")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` ログインページに戻る `);
                  } else {
                    return [
                      createTextVNode(" ログインページに戻る ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_CommonButton, {
                variant: "secondary",
                onClick: retry
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` もう一度試す `);
                  } else {
                    return [
                      createTextVNode(" もう一度試す ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></div>`);
            } else if (unref(success)) {
              _push2(`<div class="space-y-4" data-v-bd9f73ff${_scopeId}><div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto" data-v-bd9f73ff${_scopeId}><svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-bd9f73ff${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-v-bd9f73ff${_scopeId}></path></svg></div><h2 class="text-xl font-semibold text-gray-900 dark:text-white" data-v-bd9f73ff${_scopeId}> 認証成功 </h2><p class="text-gray-600 dark:text-gray-400" data-v-bd9f73ff${_scopeId}> リダイレクトしています... </p></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(loading) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "space-y-4"
              }, [
                createVNode(_component_CommonLoadingSpinner, {
                  size: "lg",
                  class: "mx-auto"
                }),
                createVNode("h2", { class: "text-xl font-semibold text-gray-900 dark:text-white" }, " 認証処理中... "),
                createVNode("p", { class: "text-gray-600 dark:text-gray-400" }, toDisplayString(unref(providerName)) + "アカウントで" + toDisplayString(unref(isRegistering) ? "アカウントを作成" : "ログイン") + "しています ", 1)
              ])) : unref(error) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "space-y-4"
              }, [
                createVNode("div", { class: "w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto" }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-8 h-8 text-red-600 dark:text-red-400",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    })
                  ]))
                ]),
                createVNode("h2", { class: "text-xl font-semibold text-gray-900 dark:text-white" }, " 認証エラー "),
                createVNode("p", { class: "text-gray-600 dark:text-gray-400" }, toDisplayString(unref(error)), 1),
                createVNode("div", { class: "flex flex-col sm:flex-row gap-3 justify-center mt-6" }, [
                  createVNode(_component_CommonButton, {
                    variant: "primary",
                    onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/auth")
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" ログインページに戻る ")
                    ]),
                    _: 1
                  }, 8, ["onClick"]),
                  createVNode(_component_CommonButton, {
                    variant: "secondary",
                    onClick: retry
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" もう一度試す ")
                    ]),
                    _: 1
                  })
                ])
              ])) : unref(success) ? (openBlock(), createBlock("div", {
                key: 2,
                class: "space-y-4"
              }, [
                createVNode("div", { class: "w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto" }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-8 h-8 text-green-600 dark:text-green-400",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M5 13l4 4L19 7"
                    })
                  ]))
                ]),
                createVNode("h2", { class: "text-xl font-semibold text-gray-900 dark:text-white" }, " 認証成功 "),
                createVNode("p", { class: "text-gray-600 dark:text-gray-400" }, " リダイレクトしています... ")
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth/callback/[provider].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _provider_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bd9f73ff"]]);
export {
  _provider_ as default
};
//# sourceMappingURL=_provider_-C8y4XCpi.js.map
