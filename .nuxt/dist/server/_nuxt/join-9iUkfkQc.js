import { _ as _sfc_main$1 } from "./LoadingSpinner-DwDpbgSM.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { _ as __nuxt_component_2 } from "./Button-BAc5buFc.js";
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, toDisplayString, createVNode, unref, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import { u as useToast } from "./useToast-CcSWCLuS.js";
import { u as useAuthStore } from "./auth-DJ_gFT6B.js";
import { u as useI18n, b as useRoute, a as useNuxtApp } from "../server.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "#internal/nuxt/paths";
import { storeToRefs } from "pinia";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./toast-DzkE1rsh.js";
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
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "@orpc/client";
import "@orpc/client/fetch";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "join",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const route = useRoute();
    const { $rpc } = useNuxtApp();
    const authStore = useAuthStore();
    const { isAuthenticated } = storeToRefs(authStore);
    const { error: toastError } = useToast();
    const loading = ref(false);
    const error = ref("");
    const success = ref(false);
    const organization = ref(null);
    const token = computed(() => route.query.token);
    const acceptInvitation = async () => {
      if (!token.value) {
        error.value = t("organizations.join.noToken");
        return;
      }
      loading.value = true;
      error.value = "";
      try {
        const response = await $rpc.organizations.acceptInvitation({
          token: token.value
        });
        success.value = true;
        organization.value = response.organization;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t("organizations.join.failed");
        error.value = errorMessage;
        toastError(errorMessage);
      } finally {
        loading.value = false;
      }
    };
    watch(isAuthenticated, (newValue) => {
      if (newValue && token.value && !success.value && !error.value) {
        acceptInvitation();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_CommonLoadingSpinner = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_CommonButton = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4" }, _attrs))}><div class="max-w-md w-full">`);
      if (loading.value) {
        _push(`<div class="text-center">`);
        _push(ssrRenderComponent(_component_CommonLoadingSpinner, { size: "lg" }, null, _parent));
        _push(`<p class="mt-4 text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("organizations.join.verifying"))}</p></div>`);
      } else if (error.value) {
        _push(`<div class="text-center"><div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div><h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">${ssrInterpolate(_ctx.$t("organizations.join.failed"))}</h2><p class="text-gray-600 dark:text-gray-400 mb-6">${ssrInterpolate(error.value)}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/organizations" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, { variant: "primary" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(_ctx.$t("organizations.join.backToOrganizations"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(_ctx.$t("organizations.join.backToOrganizations")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_CommonButton, { variant: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(_ctx.$t("organizations.join.backToOrganizations")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (success.value) {
        _push(`<div class="text-center"><div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div><h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">${ssrInterpolate(_ctx.$t("organizations.join.joined"))}</h2><p class="text-gray-600 dark:text-gray-400 mb-6">${ssrInterpolate(((_a = organization.value) == null ? void 0 : _a.displayName) || ((_b = organization.value) == null ? void 0 : _b.name))} ${ssrInterpolate(_ctx.$t("organizations.join.welcome"))}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/organizations/${(_c = organization.value) == null ? void 0 : _c.id}`
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, { variant: "primary" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(_ctx.$t("organizations.join.goToOrganization"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(_ctx.$t("organizations.join.goToOrganization")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_CommonButton, { variant: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(_ctx.$t("organizations.join.goToOrganization")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (!unref(isAuthenticated)) {
        _push(`<div class="text-center"><div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div><h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">${ssrInterpolate(_ctx.$t("organizations.join.loginRequired"))}</h2><p class="text-gray-600 dark:text-gray-400 mb-6">${ssrInterpolate(_ctx.$t("organizations.join.loginToJoin"))}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/login?redirect=/organizations/join?token=${unref(token)}`
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, { variant: "primary" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(_ctx.$t("organizations.join.login"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(_ctx.$t("organizations.join.login")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_CommonButton, { variant: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(_ctx.$t("organizations.join.login")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/organizations/join.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=join-9iUkfkQc.js.map
