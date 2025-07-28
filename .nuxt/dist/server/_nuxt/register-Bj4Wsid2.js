import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { _ as __nuxt_component_2 } from "./Card-gEDzb8hb.js";
import { _ as _sfc_main$1 } from "./Input-CQRSLkRN.js";
import { _ as __nuxt_component_2$1 } from "./Button-BAc5buFc.js";
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, toDisplayString, unref, createBlock, openBlock, createVNode, createCommentVNode, Fragment, renderList, withDirectives, vModelCheckbox, Transition, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain } from "vue/server-renderer";
import { u as useToast } from "./useToast-CcSWCLuS.js";
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
  __name: "register",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    useHead({
      title: t("auth.register.pageTitle")
    });
    const { error: toastError, success: toastSuccess } = useToast();
    const { $rpc } = useNuxtApp();
    const form = ref({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false
    });
    const errors = ref({
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
    const loading = ref(false);
    const error = ref("");
    const message = ref("");
    const passwordStrength = ref(0);
    const strengthColors = ["", "bg-danger", "bg-warning", "bg-info", "bg-success"];
    const strengthTextColors = ["", "text-danger", "text-warning", "text-info", "text-success"];
    const strengthTexts = computed(() => [
      "",
      t("auth.register.passwordStrength.weak"),
      t("auth.register.passwordStrength.fair"),
      t("auth.register.passwordStrength.good"),
      t("auth.register.passwordStrength.strong")
    ]);
    const checkPasswordStrength = () => {
      const password = form.value.password;
      let strength = 0;
      if (password.length >= 8) {
        strength++;
      }
      if (password.length >= 12) {
        strength++;
      }
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        strength++;
      }
      if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
        strength++;
      }
      passwordStrength.value = strength;
    };
    const clearError = (field) => {
      errors.value[field] = "";
    };
    watch(
      () => form.value.username,
      () => clearError("username")
    );
    watch(
      () => form.value.email,
      () => clearError("email")
    );
    watch(
      () => form.value.password,
      () => clearError("password")
    );
    watch(
      () => form.value.confirmPassword,
      () => clearError("confirmPassword")
    );
    const validateForm = () => {
      let isValid = true;
      errors.value = {
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
      };
      if (!form.value.username) {
        errors.value.username = t("auth.register.validation.usernameRequired");
        isValid = false;
      } else if (!/^[a-zA-Z0-9_-]+$/.test(form.value.username)) {
        errors.value.username = t("auth.register.validation.usernamePattern");
        isValid = false;
      } else if (form.value.username.length < 3) {
        errors.value.username = t("auth.register.validation.usernameLength");
        isValid = false;
      }
      if (!form.value.email) {
        errors.value.email = t("auth.register.validation.emailRequired");
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = t("auth.register.validation.emailInvalid");
        isValid = false;
      }
      if (!form.value.password) {
        errors.value.password = t("auth.register.validation.passwordRequired");
        isValid = false;
      } else if (form.value.password.length < 8) {
        errors.value.password = t("auth.register.validation.passwordLength");
        isValid = false;
      }
      if (!form.value.confirmPassword) {
        errors.value.confirmPassword = t("auth.register.validation.passwordRequired");
        isValid = false;
      } else if (form.value.password !== form.value.confirmPassword) {
        errors.value.confirmPassword = t("auth.register.validation.passwordMismatch");
        isValid = false;
      }
      return isValid;
    };
    const handleRegister = async (event) => {
      event.preventDefault();
      if (!validateForm()) {
        return;
      }
      loading.value = true;
      error.value = "";
      message.value = "";
      try {
        await $rpc.auth.register({
          username: form.value.username,
          email: form.value.email,
          password: form.value.password
        });
        message.value = t("auth.register.accountCreated");
        toastSuccess(t("auth.register.accountCreatedShort"));
        form.value = {
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeToTerms: false
        };
        setTimeout(() => {
          navigateTo("/login");
        }, 3e3);
      } catch (err) {
        error.value = err.message || t("auth.register.errors.generalError");
        toastError(err.message || t("auth.register.errors.generalError"));
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
          action: "register"
        });
        (void 0).location.href = response.authorizationUrl;
      } catch (err) {
        error.value = err.message || t("errors.oauth.registrationFailed", { provider });
        loading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_CommonCard = __nuxt_component_2;
      const _component_CommonInput = _sfc_main$1;
      const _component_CommonButton = __nuxt_component_2$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900" }, _attrs))} data-v-8bf7305d><div class="max-w-md w-full space-y-8" data-v-8bf7305d><div class="text-center" data-v-8bf7305d><div class="flex justify-center mb-6 stagger-item stagger-1" data-v-8bf7305d><div class="w-16 h-16 bg-primary-600 dark:bg-primary-500 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300" data-v-8bf7305d><span class="text-3xl font-bold text-white" data-v-8bf7305d>Z</span></div></div><h2 class="text-3xl font-bold text-gray-900 dark:text-white stagger-item stagger-2" data-v-8bf7305d>${ssrInterpolate(_ctx.$t("auth.register.title"))}</h2><p class="mt-2 text-sm text-gray-600 dark:text-gray-400 stagger-item stagger-3" data-v-8bf7305d>${ssrInterpolate(_ctx.$t("auth.register.subtitle"))} `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("nav.login"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("nav.login")), 1)
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
            _push2(`<form class="space-y-6" data-v-8bf7305d${_scopeId}><div class="space-y-4" data-v-8bf7305d${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: unref(form).username,
              "onUpdate:modelValue": ($event) => unref(form).username = $event,
              type: "text",
              label: _ctx.$t("auth.register.username"),
              placeholder: _ctx.$t("placeholders.username"),
              hint: _ctx.$t("auth.register.usernameHint"),
              required: "",
              pattern: "[a-zA-Z0-9_-]+",
              size: "lg",
              error: unref(errors).username,
              class: "stagger-item stagger-5"
            }, {
              prefix: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8bf7305d${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" data-v-8bf7305d${_scopeId2}></path></svg>`);
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
                        d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      })
                    ]))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: unref(form).email,
              "onUpdate:modelValue": ($event) => unref(form).email = $event,
              type: "email",
              label: _ctx.$t("auth.register.email"),
              placeholder: _ctx.$t("placeholders.email"),
              required: "",
              size: "lg",
              error: unref(errors).email,
              class: "stagger-item stagger-6"
            }, {
              prefix: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8bf7305d${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" data-v-8bf7305d${_scopeId2}></path></svg>`);
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
              label: _ctx.$t("auth.register.password"),
              placeholder: "••••••••",
              hint: _ctx.$t("auth.register.passwordHint"),
              required: "",
              size: "lg",
              error: unref(errors).password,
              onInput: checkPasswordStrength,
              class: "stagger-item stagger-7"
            }, {
              prefix: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8bf7305d${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" data-v-8bf7305d${_scopeId2}></path></svg>`);
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
            if (unref(form).password) {
              _push2(`<div class="space-y-1 stagger-item stagger-8" data-v-8bf7305d${_scopeId}><div class="flex gap-1" data-v-8bf7305d${_scopeId}><!--[-->`);
              ssrRenderList(4, (i) => {
                _push2(`<div class="${ssrRenderClass([i <= unref(passwordStrength) ? strengthColors[unref(passwordStrength)] : "bg-gray-200 dark:bg-gray-700", "flex-1 h-1 rounded-full transition-all duration-300"])}" data-v-8bf7305d${_scopeId}></div>`);
              });
              _push2(`<!--]--></div><p class="${ssrRenderClass([strengthTextColors[unref(passwordStrength)], "text-xs"])}" data-v-8bf7305d${_scopeId}>${ssrInterpolate(unref(strengthTexts)[unref(passwordStrength)])}</p></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: unref(form).confirmPassword,
              "onUpdate:modelValue": ($event) => unref(form).confirmPassword = $event,
              type: "password",
              label: _ctx.$t("auth.register.confirmPassword"),
              placeholder: "••••••••",
              required: "",
              size: "lg",
              error: unref(errors).confirmPassword
            }, {
              prefix: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8bf7305d${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" data-v-8bf7305d${_scopeId2}></path></svg>`);
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
            _push2(`</div><label class="flex items-start" data-v-8bf7305d${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).agreeToTerms) ? ssrLooseContain(unref(form).agreeToTerms, null) : unref(form).agreeToTerms) ? " checked" : ""} type="checkbox" required class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700" data-v-8bf7305d${_scopeId}><span class="ml-2 text-sm text-gray-600 dark:text-gray-400" data-v-8bf7305d${_scopeId}><a href="/terms" target="_blank" class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300" data-v-8bf7305d${_scopeId}>${ssrInterpolate(_ctx.$t("auth.register.agreeToTerms"))}</a> ${ssrInterpolate(_ctx.$t("auth.register.and"))} <a href="/privacy" target="_blank" class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300" data-v-8bf7305d${_scopeId}>${ssrInterpolate(_ctx.$t("auth.register.privacyPolicy"))}</a> ${ssrInterpolate(_ctx.$t("auth.register.agreeToTermsText"))}</span></label>`);
            _push2(ssrRenderComponent(_component_CommonButton, {
              type: "submit",
              variant: "primary",
              size: "lg",
              fullWidth: "",
              loading: unref(loading),
              disabled: !unref(form).agreeToTerms || unref(loading)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(loading) ? _ctx.$t("auth.register.registering") : _ctx.$t("auth.register.registerButton"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(loading) ? _ctx.$t("auth.register.registering") : _ctx.$t("auth.register.registerButton")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form>`);
            if (unref(error)) {
              _push2(`<div class="rounded-lg bg-danger/10 border border-danger/20 p-4 mt-4" data-v-8bf7305d${_scopeId}><div class="flex items-center space-x-2" data-v-8bf7305d${_scopeId}><svg class="w-5 h-5 text-danger flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8bf7305d${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-8bf7305d${_scopeId}></path></svg><p class="text-sm text-danger" data-v-8bf7305d${_scopeId}>${ssrInterpolate(unref(error))}</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(``);
            if (unref(message)) {
              _push2(`<div class="rounded-lg bg-success/10 border border-success/20 p-4 mt-4" data-v-8bf7305d${_scopeId}><div class="flex items-center space-x-2" data-v-8bf7305d${_scopeId}><svg class="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8bf7305d${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-8bf7305d${_scopeId}></path></svg><p class="text-sm text-success" data-v-8bf7305d${_scopeId}>${ssrInterpolate(unref(message))}</p></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="relative mt-8" data-v-8bf7305d${_scopeId}><div class="absolute inset-0 flex items-center" data-v-8bf7305d${_scopeId}><div class="w-full border-t border-gray-300 dark:border-gray-700" data-v-8bf7305d${_scopeId}></div></div><div class="relative flex justify-center text-sm" data-v-8bf7305d${_scopeId}><span class="px-4 bg-white dark:bg-gray-800 text-gray-500" data-v-8bf7305d${_scopeId}>${ssrInterpolate(_ctx.$t("common.or"))}</span></div></div><div class="grid grid-cols-2 gap-3 mt-6" data-v-8bf7305d${_scopeId}><button type="button" class="btn btn-secondary btn-md justify-center"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-8bf7305d${_scopeId}><svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" data-v-8bf7305d${_scopeId}><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" data-v-8bf7305d${_scopeId}></path><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" data-v-8bf7305d${_scopeId}></path><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" data-v-8bf7305d${_scopeId}></path><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" data-v-8bf7305d${_scopeId}></path></svg> ${ssrInterpolate(_ctx.$t("common.providers.google"))}</button><button type="button" class="btn btn-secondary btn-md justify-center"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-8bf7305d${_scopeId}><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" data-v-8bf7305d${_scopeId}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" data-v-8bf7305d${_scopeId}></path></svg> ${ssrInterpolate(_ctx.$t("common.providers.github"))}</button></div>`);
          } else {
            return [
              createVNode("form", {
                class: "space-y-6",
                onSubmit: handleRegister
              }, [
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(_component_CommonInput, {
                    modelValue: unref(form).username,
                    "onUpdate:modelValue": ($event) => unref(form).username = $event,
                    type: "text",
                    label: _ctx.$t("auth.register.username"),
                    placeholder: _ctx.$t("placeholders.username"),
                    hint: _ctx.$t("auth.register.usernameHint"),
                    required: "",
                    pattern: "[a-zA-Z0-9_-]+",
                    size: "lg",
                    error: unref(errors).username,
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
                          d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        })
                      ]))
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue", "label", "placeholder", "hint", "error"]),
                  createVNode(_component_CommonInput, {
                    modelValue: unref(form).email,
                    "onUpdate:modelValue": ($event) => unref(form).email = $event,
                    type: "email",
                    label: _ctx.$t("auth.register.email"),
                    placeholder: _ctx.$t("placeholders.email"),
                    required: "",
                    size: "lg",
                    error: unref(errors).email,
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
                          d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        })
                      ]))
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue", "label", "placeholder", "error"]),
                  createVNode(_component_CommonInput, {
                    modelValue: unref(form).password,
                    "onUpdate:modelValue": ($event) => unref(form).password = $event,
                    type: "password",
                    label: _ctx.$t("auth.register.password"),
                    placeholder: "••••••••",
                    hint: _ctx.$t("auth.register.passwordHint"),
                    required: "",
                    size: "lg",
                    error: unref(errors).password,
                    onInput: checkPasswordStrength,
                    class: "stagger-item stagger-7"
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
                  }, 8, ["modelValue", "onUpdate:modelValue", "label", "hint", "error"]),
                  unref(form).password ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "space-y-1 stagger-item stagger-8"
                  }, [
                    createVNode("div", { class: "flex gap-1" }, [
                      (openBlock(), createBlock(Fragment, null, renderList(4, (i) => {
                        return createVNode("div", {
                          key: i,
                          class: ["flex-1 h-1 rounded-full transition-all duration-300", i <= unref(passwordStrength) ? strengthColors[unref(passwordStrength)] : "bg-gray-200 dark:bg-gray-700"]
                        }, null, 2);
                      }), 64))
                    ]),
                    createVNode("p", {
                      class: ["text-xs", strengthTextColors[unref(passwordStrength)]]
                    }, toDisplayString(unref(strengthTexts)[unref(passwordStrength)]), 3)
                  ])) : createCommentVNode("", true),
                  createVNode(_component_CommonInput, {
                    modelValue: unref(form).confirmPassword,
                    "onUpdate:modelValue": ($event) => unref(form).confirmPassword = $event,
                    type: "password",
                    label: _ctx.$t("auth.register.confirmPassword"),
                    placeholder: "••••••••",
                    required: "",
                    size: "lg",
                    error: unref(errors).confirmPassword
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
                createVNode("label", { class: "flex items-start" }, [
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => unref(form).agreeToTerms = $event,
                    type: "checkbox",
                    required: "",
                    class: "mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, unref(form).agreeToTerms]
                  ]),
                  createVNode("span", { class: "ml-2 text-sm text-gray-600 dark:text-gray-400" }, [
                    createVNode("a", {
                      href: "/terms",
                      target: "_blank",
                      class: "text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    }, toDisplayString(_ctx.$t("auth.register.agreeToTerms")), 1),
                    createTextVNode(" " + toDisplayString(_ctx.$t("auth.register.and")) + " ", 1),
                    createVNode("a", {
                      href: "/privacy",
                      target: "_blank",
                      class: "text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    }, toDisplayString(_ctx.$t("auth.register.privacyPolicy")), 1),
                    createTextVNode(" " + toDisplayString(_ctx.$t("auth.register.agreeToTermsText")), 1)
                  ])
                ]),
                createVNode(_component_CommonButton, {
                  type: "submit",
                  variant: "primary",
                  size: "lg",
                  fullWidth: "",
                  loading: unref(loading),
                  disabled: !unref(form).agreeToTerms || unref(loading)
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(loading) ? _ctx.$t("auth.register.registering") : _ctx.$t("auth.register.registerButton")), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
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
                createVNode("button", {
                  type: "button",
                  class: "btn btn-secondary btn-md justify-center",
                  onClick: ($event) => handleSocialLogin("google"),
                  disabled: unref(loading)
                }, [
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
                ], 8, ["onClick", "disabled"]),
                createVNode("button", {
                  type: "button",
                  class: "btn btn-secondary btn-md justify-center",
                  onClick: ($event) => handleSocialLogin("github"),
                  disabled: unref(loading)
                }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-5 h-5 mr-2",
                    fill: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", { d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" })
                  ])),
                  createTextVNode(" " + toDisplayString(_ctx.$t("common.providers.github")), 1)
                ], 8, ["onClick", "disabled"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const register = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8bf7305d"]]);
export {
  register as default
};
//# sourceMappingURL=register-Bj4Wsid2.js.map
