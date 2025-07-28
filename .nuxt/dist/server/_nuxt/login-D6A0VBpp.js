import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { _ as __nuxt_component_2 } from "./Card-gEDzb8hb.js";
import { _ as _sfc_main$1 } from "./Input-CQRSLkRN.js";
import { _ as __nuxt_component_2$1 } from "./Button-BAc5buFc.js";
import { defineComponent, ref, watch, mergeProps, withCtx, createTextVNode, toDisplayString, unref, createBlock, openBlock, createVNode, withDirectives, vModelCheckbox, Transition, createCommentVNode, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain } from "vue/server-renderer";
import { u as useToast } from "./useToast-CcSWCLuS.js";
import { u as useAuthStore } from "./auth-DJ_gFT6B.js";
import { u as useI18n, a as useNuxtApp, n as navigateTo } from "../server.mjs";
import { u as useHead } from "./v3-CdJoEeaK.js";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
import "./toast-DzkE1rsh.js";
import "pinia";
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
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "@orpc/client";
import "@orpc/client/fetch";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/@unhead+vue@2.0.12_vue@3.5.17_typescript@5.8.3_/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    useHead({
      title: `${t("auth.login.title")} - ZXCV`
    });
    const authStore = useAuthStore();
    const { error: toastError, success: toastSuccess } = useToast();
    const { $rpc } = useNuxtApp();
    const form = ref({
      email: "",
      password: "",
      rememberMe: false
    });
    const errors = ref({
      email: "",
      password: ""
    });
    const loading = ref(false);
    const error = ref("");
    const message = ref("");
    const clearError = (field) => {
      errors.value[field] = "";
    };
    watch(
      () => form.value.email,
      () => clearError("email")
    );
    watch(
      () => form.value.password,
      () => clearError("password")
    );
    const validateForm = () => {
      let isValid = true;
      errors.value = { email: "", password: "" };
      if (!form.value.email) {
        errors.value.email = t("auth.login.validation.emailRequired");
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = t("auth.login.validation.emailInvalid");
        isValid = false;
      }
      if (!form.value.password) {
        errors.value.password = t("auth.login.validation.passwordRequired");
        isValid = false;
      }
      return isValid;
    };
    const handleLogin = async (event) => {
      event.preventDefault();
      if (!validateForm()) {
        return;
      }
      loading.value = true;
      error.value = "";
      message.value = "";
      try {
        const response = await authStore.login(form.value);
        if (response.user && !response.user.emailVerified) {
          message.value = response.message || t("auth.login.errors.emailNotVerified");
          return;
        }
        toastSuccess(t("auth.login.loginButton"));
        await navigateTo("/rules");
      } catch (err) {
        error.value = err.message || t("auth.login.errors.invalidCredentials");
        toastError(err.message || t("auth.login.errors.generalError"));
      } finally {
        loading.value = false;
      }
    };
    const handleSocialLogin = async (provider) => {
      loading.value = true;
      error.value = "";
      try {
        const response = await $rpc.auth.oauthInitialize({
          provider,
          redirectUrl: "/rules",
          action: "login"
        });
        (void 0).location.href = response.authorizationUrl;
      } catch (err) {
        error.value = err.message || t("auth.login.errors.generalError", { provider });
        loading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_CommonCard = __nuxt_component_2;
      const _component_CommonInput = _sfc_main$1;
      const _component_CommonButton = __nuxt_component_2$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900" }, _attrs))} data-v-c268a4d8><div class="max-w-md w-full space-y-8" data-v-c268a4d8><div class="text-center" data-v-c268a4d8><div class="flex justify-center mb-6 stagger-item stagger-1" data-v-c268a4d8><div class="w-16 h-16 bg-primary-600 dark:bg-primary-500 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300" data-v-c268a4d8><span class="text-3xl font-bold text-white" data-v-c268a4d8>Z</span></div></div><h2 class="text-3xl font-bold text-gray-900 dark:text-white stagger-item stagger-2" data-v-c268a4d8>${ssrInterpolate(_ctx.$t("auth.login.title"))}</h2><p class="mt-2 text-sm text-gray-600 dark:text-gray-400 stagger-item stagger-3" data-v-c268a4d8>${ssrInterpolate(_ctx.$t("auth.login.subtitle"))} `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/register",
        class: "font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("nav.register"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("nav.register")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div>`);
      _push(ssrRenderComponent(_component_CommonCard, {
        padding: "lg",
        class: "shadow-xl border-0 stagger-item stagger-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form class="space-y-6" data-v-c268a4d8${_scopeId}><div class="space-y-4" data-v-c268a4d8${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: unref(form).email,
              "onUpdate:modelValue": ($event) => unref(form).email = $event,
              type: "email",
              label: _ctx.$t("auth.login.email"),
              placeholder: "your@email.com",
              required: "",
              size: "lg",
              error: unref(errors).email,
              class: "stagger-item stagger-5"
            }, {
              prefix: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c268a4d8${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" data-v-c268a4d8${_scopeId2}></path></svg>`);
                } else {
                  return [
                    (openBlock(), createBlock("svg", {
                      class: "w-5 h-5 text-gray-400",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      })
                    ]))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: unref(form).password,
              "onUpdate:modelValue": ($event) => unref(form).password = $event,
              type: "password",
              label: _ctx.$t("auth.login.password"),
              placeholder: "••••••••",
              required: "",
              size: "lg",
              error: unref(errors).password,
              class: "stagger-item stagger-6"
            }, {
              prefix: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c268a4d8${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" data-v-c268a4d8${_scopeId2}></path></svg>`);
                } else {
                  return [
                    (openBlock(), createBlock("svg", {
                      class: "w-5 h-5 text-gray-400",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      })
                    ]))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="flex items-center justify-between stagger-item stagger-7" data-v-c268a4d8${_scopeId}><label class="flex items-center group cursor-pointer" data-v-c268a4d8${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).rememberMe) ? ssrLooseContain(unref(form).rememberMe, null) : unref(form).rememberMe) ? " checked" : ""} type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 transition-all duration-200 group-hover:scale-110" data-v-c268a4d8${_scopeId}><span class="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-200" data-v-c268a4d8${_scopeId}>${ssrInterpolate(_ctx.$t("auth.login.rememberMe"))}</span></label>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/forgot-password",
              class: "text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 hover:underline"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(_ctx.$t("auth.login.forgotPassword"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(_ctx.$t("auth.login.forgotPassword")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_CommonButton, {
              type: "submit",
              variant: "primary",
              size: "lg",
              fullWidth: "",
              loading: unref(loading),
              class: "stagger-item stagger-8 hover-lift"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(loading) ? _ctx.$t("auth.login.loggingIn") : _ctx.$t("auth.login.loginButton"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(loading) ? _ctx.$t("auth.login.loggingIn") : _ctx.$t("auth.login.loginButton")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form>`);
            if (unref(error)) {
              _push2(`<div class="rounded-lg bg-danger/10 border border-danger/20 p-4 mt-4" data-v-c268a4d8${_scopeId}><div class="flex items-center space-x-2" data-v-c268a4d8${_scopeId}><svg class="w-5 h-5 text-danger flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c268a4d8${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-c268a4d8${_scopeId}></path></svg><p class="text-sm text-danger" data-v-c268a4d8${_scopeId}>${ssrInterpolate(unref(error))}</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(``);
            if (unref(message)) {
              _push2(`<div class="rounded-lg bg-success/10 border border-success/20 p-4 mt-4" data-v-c268a4d8${_scopeId}><div class="flex items-center space-x-2" data-v-c268a4d8${_scopeId}><svg class="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c268a4d8${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-c268a4d8${_scopeId}></path></svg><p class="text-sm text-success" data-v-c268a4d8${_scopeId}>${ssrInterpolate(unref(message))}</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="relative mt-8" data-v-c268a4d8${_scopeId}><div class="absolute inset-0 flex items-center" data-v-c268a4d8${_scopeId}><div class="w-full border-t border-gray-300 dark:border-gray-700" data-v-c268a4d8${_scopeId}></div></div><div class="relative flex justify-center text-sm" data-v-c268a4d8${_scopeId}><span class="px-4 bg-white dark:bg-gray-800 text-gray-500" data-v-c268a4d8${_scopeId}>${ssrInterpolate(_ctx.$t("common.or"))}</span></div></div><div class="grid grid-cols-2 gap-3 mt-6" data-v-c268a4d8${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CommonButton, {
              type: "button",
              variant: "secondary",
              fullWidth: "",
              onClick: ($event) => handleSocialLogin("google"),
              disabled: unref(loading)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" data-v-c268a4d8${_scopeId2}><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" data-v-c268a4d8${_scopeId2}></path><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" data-v-c268a4d8${_scopeId2}></path><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" data-v-c268a4d8${_scopeId2}></path><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" data-v-c268a4d8${_scopeId2}></path></svg> ${ssrInterpolate(_ctx.$t("common.providers.google"))}`);
                } else {
                  return [
                    (openBlock(), createBlock("svg", {
                      class: "w-5 h-5 mr-2",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        fill: "currentColor",
                        d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      }),
                      createVNode("path", {
                        fill: "currentColor",
                        d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      }),
                      createVNode("path", {
                        fill: "currentColor",
                        d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      }),
                      createVNode("path", {
                        fill: "currentColor",
                        d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      })
                    ])),
                    createTextVNode(" " + toDisplayString(_ctx.$t("common.providers.google")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_CommonButton, {
              type: "button",
              variant: "secondary",
              fullWidth: "",
              onClick: ($event) => handleSocialLogin("github"),
              disabled: unref(loading)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" data-v-c268a4d8${_scopeId2}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" data-v-c268a4d8${_scopeId2}></path></svg> ${ssrInterpolate(_ctx.$t("common.providers.github"))}`);
                } else {
                  return [
                    (openBlock(), createBlock("svg", {
                      class: "w-5 h-5 mr-2",
                      fill: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", { d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" })
                    ])),
                    createTextVNode(" " + toDisplayString(_ctx.$t("common.providers.github")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("form", {
                class: "space-y-6",
                onSubmit: handleLogin
              }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(_component_CommonInput, {
                    modelValue: unref(form).email,
                    "onUpdate:modelValue": ($event) => unref(form).email = $event,
                    type: "email",
                    label: _ctx.$t("auth.login.email"),
                    placeholder: "your@email.com",
                    required: "",
                    size: "lg",
                    error: unref(errors).email,
                    class: "stagger-item stagger-5"
                  }, {
                    prefix: withCtx(() => [
                      (openBlock(), createBlock("svg", {
                        class: "w-5 h-5 text-gray-400",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        })
                      ]))
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue", "label", "error"]),
                  createVNode(_component_CommonInput, {
                    modelValue: unref(form).password,
                    "onUpdate:modelValue": ($event) => unref(form).password = $event,
                    type: "password",
                    label: _ctx.$t("auth.login.password"),
                    placeholder: "••••••••",
                    required: "",
                    size: "lg",
                    error: unref(errors).password,
                    class: "stagger-item stagger-6"
                  }, {
                    prefix: withCtx(() => [
                      (openBlock(), createBlock("svg", {
                        class: "w-5 h-5 text-gray-400",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        })
                      ]))
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue", "label", "error"])
                ]),
                createVNode("div", { class: "flex items-center justify-between stagger-item stagger-7" }, [
                  createVNode("label", { class: "flex items-center group cursor-pointer" }, [
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => unref(form).rememberMe = $event,
                      type: "checkbox",
                      class: "w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 transition-all duration-200 group-hover:scale-110"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelCheckbox, unref(form).rememberMe]
                    ]),
                    createVNode("span", { class: "ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-200" }, toDisplayString(_ctx.$t("auth.login.rememberMe")), 1)
                  ]),
                  createVNode(_component_NuxtLink, {
                    to: "/forgot-password",
                    class: "text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200 hover:underline"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(_ctx.$t("auth.login.forgotPassword")), 1)
                    ]),
                    _: 1
                  })
                ]),
                createVNode(_component_CommonButton, {
                  type: "submit",
                  variant: "primary",
                  size: "lg",
                  fullWidth: "",
                  loading: unref(loading),
                  class: "stagger-item stagger-8 hover-lift"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(loading) ? _ctx.$t("auth.login.loggingIn") : _ctx.$t("auth.login.loginButton")), 1)
                  ]),
                  _: 1
                }, 8, ["loading"])
              ], 32),
              createVNode(Transition, { name: "fade" }, {
                default: withCtx(() => [
                  unref(error) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "rounded-lg bg-danger/10 border border-danger/20 p-4 mt-4"
                  }, [
                    createVNode("div", { class: "flex items-center space-x-2" }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-5 h-5 text-danger flex-shrink-0",
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
                      ])),
                      createVNode("p", { class: "text-sm text-danger" }, toDisplayString(unref(error)), 1)
                    ])
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              createVNode(Transition, { name: "fade" }, {
                default: withCtx(() => [
                  unref(message) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "rounded-lg bg-success/10 border border-success/20 p-4 mt-4"
                  }, [
                    createVNode("div", { class: "flex items-center space-x-2" }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-5 h-5 text-success flex-shrink-0",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        })
                      ])),
                      createVNode("p", { class: "text-sm text-success" }, toDisplayString(unref(message)), 1)
                    ])
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              createVNode("div", { class: "relative mt-8" }, [
                createVNode("div", { class: "absolute inset-0 flex items-center" }, [
                  createVNode("div", { class: "w-full border-t border-gray-300 dark:border-gray-700" })
                ]),
                createVNode("div", { class: "relative flex justify-center text-sm" }, [
                  createVNode("span", { class: "px-4 bg-white dark:bg-gray-800 text-gray-500" }, toDisplayString(_ctx.$t("common.or")), 1)
                ])
              ]),
              createVNode("div", { class: "grid grid-cols-2 gap-3 mt-6" }, [
                createVNode(_component_CommonButton, {
                  type: "button",
                  variant: "secondary",
                  fullWidth: "",
                  onClick: ($event) => handleSocialLogin("google"),
                  disabled: unref(loading)
                }, {
                  default: withCtx(() => [
                    (openBlock(), createBlock("svg", {
                      class: "w-5 h-5 mr-2",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        fill: "currentColor",
                        d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      }),
                      createVNode("path", {
                        fill: "currentColor",
                        d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      }),
                      createVNode("path", {
                        fill: "currentColor",
                        d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      }),
                      createVNode("path", {
                        fill: "currentColor",
                        d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      })
                    ])),
                    createTextVNode(" " + toDisplayString(_ctx.$t("common.providers.google")), 1)
                  ]),
                  _: 1
                }, 8, ["onClick", "disabled"]),
                createVNode(_component_CommonButton, {
                  type: "button",
                  variant: "secondary",
                  fullWidth: "",
                  onClick: ($event) => handleSocialLogin("github"),
                  disabled: unref(loading)
                }, {
                  default: withCtx(() => [
                    (openBlock(), createBlock("svg", {
                      class: "w-5 h-5 mr-2",
                      fill: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", { d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" })
                    ])),
                    createTextVNode(" " + toDisplayString(_ctx.$t("common.providers.github")), 1)
                  ]),
                  _: 1
                }, 8, ["onClick", "disabled"])
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c268a4d8"]]);
export {
  login as default
};
//# sourceMappingURL=login-D6A0VBpp.js.map
