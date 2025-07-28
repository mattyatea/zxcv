import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { _ as __nuxt_component_3$1 } from "./Modal-DWgkDmQ5.js";
import { _ as _sfc_main$2 } from "./Input-CQRSLkRN.js";
import { defineComponent, computed, mergeProps, createVNode, resolveDynamicComponent, useSSRContext, ref, withCtx, unref, createTextVNode, toDisplayString, createBlock, openBlock, withModifiers, createCommentVNode } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrRenderSlot, ssrRenderVNode, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import { _ as __nuxt_component_2 } from "./Button-BAc5buFc.js";
import { useRoute } from "vue-router";
import { u as useToast } from "./useToast-CcSWCLuS.js";
import { u as useAuthStore } from "./auth-DJ_gFT6B.js";
import { a as useNuxtApp } from "../server.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "#internal/nuxt/paths";
import { storeToRefs } from "pinia";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
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
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "@orpc/client";
import "@orpc/client/fetch";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Badge",
  __ssrInlineRender: true,
  props: {
    variant: { default: "gray" },
    size: { default: "sm" },
    rounded: { default: "full" },
    closable: { type: Boolean, default: false },
    icon: {},
    dot: { type: Boolean, default: false }
  },
  emits: ["close"],
  setup(__props) {
    const props = __props;
    const badgeClasses = computed(() => {
      const base = "badge inline-flex items-center font-medium transition-all duration-200";
      const variants = {
        primary: "badge-primary",
        success: "badge-success",
        warning: "badge-warning",
        danger: "badge-danger",
        info: "badge-info",
        gray: "badge-gray"
      };
      const sizes = {
        xs: "text-xs px-2 py-0.5",
        sm: "text-xs px-2.5 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5"
      };
      const roundedStyles = {
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full"
      };
      return [base, variants[props.variant], sizes[props.size], roundedStyles[props.rounded]].join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({ class: badgeClasses.value }, _attrs))} data-v-bb0bdee7>`);
      if (_ctx.$slots.icon || _ctx.icon || _ctx.dot) {
        _push(`<span class="badge-icon" data-v-bb0bdee7>`);
        if (_ctx.dot) {
          _push(`<span class="badge-dot" data-v-bb0bdee7></span>`);
        } else {
          ssrRenderSlot(_ctx.$slots, "icon", {}, () => {
            if (_ctx.icon) {
              ssrRenderVNode(_push, createVNode(resolveDynamicComponent(_ctx.icon), null, null), _parent);
            } else {
              _push(`<!---->`);
            }
          }, _push, _parent);
        }
        _push(`</span>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      if (_ctx.closable) {
        _push(`<button type="button" class="badge-close" data-v-bb0bdee7><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-bb0bdee7><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-bb0bdee7></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</span>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/Badge.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-bb0bdee7"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[username]",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    const { $rpc, $t } = useNuxtApp();
    const authStore = useAuthStore();
    const { user: currentUser } = storeToRefs(authStore);
    const loading = ref(true);
    const error = ref(null);
    const user = ref(null);
    const stats = ref({
      rulesCount: 0,
      organizationsCount: 0
    });
    const recentRules = ref([]);
    const isEditing = ref(false);
    const updating = ref(false);
    const updateError = ref(null);
    const editForm = ref({
      username: "",
      email: ""
    });
    const errors = ref({});
    const showPasswordChange = ref(false);
    const changingPassword = ref(false);
    const passwordError = ref(null);
    const passwordForm = ref({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    const passwordErrors = ref({});
    const showAvatarUpload = ref(false);
    const isOwnProfile = computed(() => {
      var _a, _b;
      return ((_a = currentUser.value) == null ? void 0 : _a.id) === ((_b = user.value) == null ? void 0 : _b.id);
    });
    const isFormValid = computed(() => {
      const hasUsername = editForm.value.username.trim().length > 0;
      const hasEmail = editForm.value.email.trim().length > 0;
      const hasNoErrors = !errors.value.username && !errors.value.email;
      return hasUsername && hasEmail && hasNoErrors;
    });
    const isPasswordFormValid = computed(() => {
      return passwordForm.value.currentPassword.length > 0 && passwordForm.value.newPassword.length >= 8 && passwordForm.value.confirmPassword.length > 0 && Object.keys(passwordErrors.value).length === 0;
    });
    const formatDate = (timestamp) => {
      const date = new Date(timestamp * 1e3);
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    };
    const validateUsername = () => {
      errors.value.username = "";
      const username = editForm.value.username.trim();
      if (!username) {
        errors.value.username = $t("profile.errors.usernameRequired");
      } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        errors.value.username = $t("profile.errors.usernameInvalid");
      } else if (username.length < 3) {
        errors.value.username = $t("profile.errors.usernameMinLength");
      }
    };
    const validateEmail = () => {
      errors.value.email = "";
      const email = editForm.value.email.trim();
      if (!email) {
        errors.value.email = $t("profile.errors.emailRequired");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.value.email = $t("profile.errors.emailInvalid");
      }
    };
    const validateNewPassword = () => {
      passwordErrors.value.newPassword = "";
      if (passwordForm.value.newPassword.length < 8) {
        passwordErrors.value.newPassword = $t("profile.errors.passwordMinLength");
      }
    };
    const validatePasswordConfirm = () => {
      passwordErrors.value.confirmPassword = "";
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        passwordErrors.value.confirmPassword = $t("profile.errors.passwordMismatch");
      }
    };
    const updateProfile = async () => {
      console.log("updateProfile called");
      console.log("isFormValid:", isFormValid.value);
      console.log("editForm:", editForm.value);
      console.log("errors:", errors.value);
      try {
        updating.value = true;
        updateError.value = null;
        validateUsername();
        validateEmail();
        if (!isFormValid.value) {
          console.log("Form is invalid, returning");
          return;
        }
        console.log("Calling API with:", {
          username: editForm.value.username.trim(),
          email: editForm.value.email.trim()
        });
        const result = await $rpc.users.updateProfile({
          username: editForm.value.username.trim(),
          email: editForm.value.email.trim()
        });
        console.log("API response:", result);
        user.value = result.user;
        isEditing.value = false;
        if (isOwnProfile.value) {
          await authStore.updateUser(result.user);
        }
        const { success } = useToast();
        success($t("profile.success.profileUpdated"));
      } catch (err) {
        console.error("Failed to update profile:", err);
        if (err instanceof Error) {
          if (err.message.includes("already in use")) {
            updateError.value = $t("profile.errors.usernameOrEmailTaken");
          } else {
            updateError.value = err.message || $t("profile.errors.updateFailed");
          }
        } else {
          updateError.value = $t("profile.errors.updateFailed");
        }
      } finally {
        updating.value = false;
      }
    };
    const cancelEdit = () => {
      isEditing.value = false;
      updateError.value = null;
      errors.value = {};
      if (user.value) {
        editForm.value = {
          username: user.value.username,
          email: user.value.email
        };
      }
      console.log("cancelEdit - errors cleared:", errors.value);
    };
    const changePassword = async () => {
      try {
        changingPassword.value = true;
        passwordError.value = null;
        validateNewPassword();
        validatePasswordConfirm();
        if (!isPasswordFormValid.value) {
          return;
        }
        await $rpc.users.changePassword({
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        });
        passwordForm.value = {
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        };
        passwordErrors.value = {};
        showPasswordChange.value = false;
        const { success } = useToast();
        success($t("profile.success.passwordChanged"));
      } catch (err) {
        console.error("Failed to change password:", err);
        if (err instanceof Error) {
          if (err.message.includes("incorrect") || err.message.includes("wrong")) {
            passwordError.value = $t("profile.errors.wrongCurrentPassword");
          } else {
            passwordError.value = err.message || $t("profile.errors.passwordChangeFailed");
          }
        } else {
          passwordError.value = $t("profile.errors.passwordChangeFailed");
        }
      } finally {
        changingPassword.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_CommonModal = __nuxt_component_3$1;
      const _component_CommonInput = _sfc_main$2;
      const _component_CommonBadge = __nuxt_component_3;
      const _component_CommonButton = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto max-w-4xl px-4 py-8" }, _attrs))}>`);
      if (loading.value) {
        _push(`<div class="flex justify-center items-center min-h-[400px]"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>`);
      } else if (error.value) {
        _push(`<div class="text-center py-8"><p class="text-red-600 mb-4">${ssrInterpolate(error.value)}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "text-blue-600 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref($t)("profile.backToHome"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref($t)("profile.backToHome")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (user.value) {
        _push(`<div><div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-6"><div class="flex items-start justify-between"><div class="flex items-center space-x-4"><div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">${ssrInterpolate(user.value.username.charAt(0).toUpperCase())}</div><div><h1 class="text-2xl font-bold text-gray-900 dark:text-white">${ssrInterpolate(user.value.username)}</h1><p class="text-gray-600 dark:text-gray-400">${ssrInterpolate(user.value.email)}</p><div class="flex items-center mt-2">`);
        if (user.value.emailVerified) {
          _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"><svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> ${ssrInterpolate(unref($t)("profile.emailVerified"))}</span>`);
        } else {
          _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">${ssrInterpolate(unref($t)("profile.emailNotVerified"))}</span>`);
        }
        _push(`</div></div></div>`);
        if (isOwnProfile.value) {
          _push(`<button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">${ssrInterpolate(unref($t)("profile.editProfile"))}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"><div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6"><h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${ssrInterpolate(unref($t)("profile.createdRules"))}</h3><p class="text-3xl font-bold text-blue-600">${ssrInterpolate(stats.value.rulesCount || 0)}</p></div><div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6"><h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${ssrInterpolate(unref($t)("profile.belongingOrganizations"))}</h3><p class="text-3xl font-bold text-green-600">${ssrInterpolate(stats.value.organizationsCount || 0)}</p></div><div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6"><h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${ssrInterpolate(unref($t)("profile.registrationDate"))}</h3><p class="text-lg text-gray-600 dark:text-gray-400">${ssrInterpolate(formatDate(user.value.createdAt))}</p></div></div><div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6"><h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">${ssrInterpolate(unref($t)("profile.recentActivity"))}</h2>`);
        if (recentRules.value.length > 0) {
          _push(`<div class="space-y-4"><!--[-->`);
          ssrRenderList(recentRules.value, (rule) => {
            _push(`<div class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"><div class="flex justify-between items-start"><div>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: rule.organization ? `/rules/@${rule.organization.name}/${rule.name}` : `/rules/@${user.value.username}/${rule.name}`,
              class: "text-lg font-medium text-blue-600 hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(rule.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(rule.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${ssrInterpolate(rule.description)}</p></div><span class="text-sm text-gray-500 dark:text-gray-500">${ssrInterpolate(formatDate(rule.updatedAt))}</span></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-gray-500 dark:text-gray-400 text-center py-8">${ssrInterpolate(unref($t)("profile.noActivityYet"))}</div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_CommonModal, {
        modelValue: isEditing.value,
        "onUpdate:modelValue": ($event) => isEditing.value = $event,
        title: unref($t)("profile.editProfile"),
        onClose: cancelEdit
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b;
          if (_push2) {
            _push2(`<form class="space-y-4"${_scopeId}><div class="flex flex-col items-center mb-6"${_scopeId}><div class="relative"${_scopeId}><div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold"${_scopeId}>${ssrInterpolate(editForm.value.username.charAt(0).toUpperCase())}</div><button type="button" class="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"${ssrRenderAttr("title", unref($t)("profile.changeAvatar"))}${_scopeId}><svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"${_scopeId}></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"${_scopeId}></path></svg></button></div><p class="text-sm text-gray-500 dark:text-gray-400 mt-2"${_scopeId}>${ssrInterpolate(unref($t)("profile.avatarChangeComingSoon"))}</p></div><div${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: editForm.value.username,
              "onUpdate:modelValue": ($event) => editForm.value.username = $event,
              label: unref($t)("profile.username"),
              placeholder: unref($t)("profile.placeholders.username"),
              error: errors.value.username,
              required: "",
              onBlur: validateUsername
            }, {
              hint: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<p class="text-xs text-gray-500 dark:text-gray-400 mt-1"${_scopeId2}>${ssrInterpolate(unref($t)("profile.usernameHint"))}</p>`);
                } else {
                  return [
                    createVNode("p", { class: "text-xs text-gray-500 dark:text-gray-400 mt-1" }, toDisplayString(unref($t)("profile.usernameHint")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: editForm.value.email,
              "onUpdate:modelValue": ($event) => editForm.value.email = $event,
              type: "email",
              label: unref($t)("profile.email"),
              placeholder: unref($t)("profile.placeholders.email"),
              error: errors.value.email,
              required: "",
              onBlur: validateEmail
            }, null, _parent2, _scopeId));
            if (editForm.value.email !== ((_a = user.value) == null ? void 0 : _a.email)) {
              _push2(`<div class="mt-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_CommonBadge, {
                variant: "warning",
                size: "sm"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"${_scopeId2}><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"${_scopeId2}></path></svg> ${ssrInterpolate(unref($t)("profile.emailChangeWarning"))}`);
                  } else {
                    return [
                      (openBlock(), createBlock("svg", {
                        class: "w-3 h-3 mr-1",
                        fill: "currentColor",
                        viewBox: "0 0 20 20"
                      }, [
                        createVNode("path", {
                          "fill-rule": "evenodd",
                          d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
                          "clip-rule": "evenodd"
                        })
                      ])),
                      createTextVNode(" " + toDisplayString(unref($t)("profile.emailChangeWarning")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="pt-4 border-t border-gray-200 dark:border-gray-700"${_scopeId}><button type="button" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"${_scopeId}>${ssrInterpolate(unref($t)("profile.changePassword"))}</button></div>`);
            if (updateError.value) {
              _push2(`<div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"${_scopeId}><p class="text-sm text-red-600 dark:text-red-400"${_scopeId}>${ssrInterpolate(updateError.value)}</p></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="flex justify-end space-x-3 pt-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CommonButton, {
              type: "button",
              variant: "secondary",
              onClick: cancelEdit
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref($t)("common.cancel"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref($t)("common.cancel")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_CommonButton, {
              type: "submit",
              loading: updating.value,
              disabled: !isFormValid.value || updating.value
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref($t)("profile.update"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref($t)("profile.update")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></form>`);
          } else {
            return [
              createVNode("form", {
                onSubmit: withModifiers(updateProfile, ["prevent"]),
                class: "space-y-4"
              }, [
                createVNode("div", { class: "flex flex-col items-center mb-6" }, [
                  createVNode("div", { class: "relative" }, [
                    createVNode("div", { class: "w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold" }, toDisplayString(editForm.value.username.charAt(0).toUpperCase()), 1),
                    createVNode("button", {
                      type: "button",
                      class: "absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors",
                      onClick: ($event) => showAvatarUpload.value = true,
                      title: unref($t)("profile.changeAvatar")
                    }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-4 h-4 text-gray-600 dark:text-gray-300",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        }),
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        })
                      ]))
                    ], 8, ["onClick", "title"])
                  ]),
                  createVNode("p", { class: "text-sm text-gray-500 dark:text-gray-400 mt-2" }, toDisplayString(unref($t)("profile.avatarChangeComingSoon")), 1)
                ]),
                createVNode("div", null, [
                  createVNode(_component_CommonInput, {
                    modelValue: editForm.value.username,
                    "onUpdate:modelValue": ($event) => editForm.value.username = $event,
                    label: unref($t)("profile.username"),
                    placeholder: unref($t)("profile.placeholders.username"),
                    error: errors.value.username,
                    required: "",
                    onBlur: validateUsername
                  }, {
                    hint: withCtx(() => [
                      createVNode("p", { class: "text-xs text-gray-500 dark:text-gray-400 mt-1" }, toDisplayString(unref($t)("profile.usernameHint")), 1)
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue", "label", "placeholder", "error"])
                ]),
                createVNode("div", null, [
                  createVNode(_component_CommonInput, {
                    modelValue: editForm.value.email,
                    "onUpdate:modelValue": ($event) => editForm.value.email = $event,
                    type: "email",
                    label: unref($t)("profile.email"),
                    placeholder: unref($t)("profile.placeholders.email"),
                    error: errors.value.email,
                    required: "",
                    onBlur: validateEmail
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "placeholder", "error"]),
                  editForm.value.email !== ((_b = user.value) == null ? void 0 : _b.email) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "mt-2"
                  }, [
                    createVNode(_component_CommonBadge, {
                      variant: "warning",
                      size: "sm"
                    }, {
                      default: withCtx(() => [
                        (openBlock(), createBlock("svg", {
                          class: "w-3 h-3 mr-1",
                          fill: "currentColor",
                          viewBox: "0 0 20 20"
                        }, [
                          createVNode("path", {
                            "fill-rule": "evenodd",
                            d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
                            "clip-rule": "evenodd"
                          })
                        ])),
                        createTextVNode(" " + toDisplayString(unref($t)("profile.emailChangeWarning")), 1)
                      ]),
                      _: 1
                    })
                  ])) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "pt-4 border-t border-gray-200 dark:border-gray-700" }, [
                  createVNode("button", {
                    type: "button",
                    onClick: ($event) => showPasswordChange.value = true,
                    class: "text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  }, toDisplayString(unref($t)("profile.changePassword")), 9, ["onClick"])
                ]),
                updateError.value ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                }, [
                  createVNode("p", { class: "text-sm text-red-600 dark:text-red-400" }, toDisplayString(updateError.value), 1)
                ])) : createCommentVNode("", true),
                createVNode("div", { class: "flex justify-end space-x-3 pt-4" }, [
                  createVNode(_component_CommonButton, {
                    type: "button",
                    variant: "secondary",
                    onClick: cancelEdit
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref($t)("common.cancel")), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_CommonButton, {
                    type: "submit",
                    loading: updating.value,
                    disabled: !isFormValid.value || updating.value
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref($t)("profile.update")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "disabled"])
                ])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_CommonModal, {
        modelValue: showPasswordChange.value,
        "onUpdate:modelValue": ($event) => showPasswordChange.value = $event,
        title: unref($t)("profile.changePassword"),
        onClose: ($event) => showPasswordChange.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: passwordForm.value.currentPassword,
              "onUpdate:modelValue": ($event) => passwordForm.value.currentPassword = $event,
              type: "password",
              label: unref($t)("profile.currentPassword"),
              placeholder: unref($t)("profile.placeholders.currentPassword"),
              error: passwordErrors.value.currentPassword,
              required: ""
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: passwordForm.value.newPassword,
              "onUpdate:modelValue": ($event) => passwordForm.value.newPassword = $event,
              type: "password",
              label: unref($t)("profile.newPassword"),
              placeholder: unref($t)("profile.placeholders.newPassword"),
              error: passwordErrors.value.newPassword,
              required: "",
              onBlur: validateNewPassword
            }, {
              hint: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<p class="text-xs text-gray-500 dark:text-gray-400 mt-1"${_scopeId2}>${ssrInterpolate(unref($t)("profile.passwordHint"))}</p>`);
                } else {
                  return [
                    createVNode("p", { class: "text-xs text-gray-500 dark:text-gray-400 mt-1" }, toDisplayString(unref($t)("profile.passwordHint")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: passwordForm.value.confirmPassword,
              "onUpdate:modelValue": ($event) => passwordForm.value.confirmPassword = $event,
              type: "password",
              label: unref($t)("profile.newPasswordConfirm"),
              placeholder: unref($t)("profile.placeholders.newPasswordConfirm"),
              error: passwordErrors.value.confirmPassword,
              required: "",
              onBlur: validatePasswordConfirm
            }, null, _parent2, _scopeId));
            if (passwordError.value) {
              _push2(`<div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"${_scopeId}><p class="text-sm text-red-600 dark:text-red-400"${_scopeId}>${ssrInterpolate(passwordError.value)}</p></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="flex justify-end space-x-3 pt-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CommonButton, {
              type: "button",
              variant: "secondary",
              onClick: ($event) => showPasswordChange.value = false
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref($t)("common.cancel"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref($t)("common.cancel")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_CommonButton, {
              type: "submit",
              loading: changingPassword.value,
              disabled: !isPasswordFormValid.value || changingPassword.value
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref($t)("profile.change"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref($t)("profile.change")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></form>`);
          } else {
            return [
              createVNode("form", {
                onSubmit: withModifiers(changePassword, ["prevent"]),
                class: "space-y-4"
              }, [
                createVNode(_component_CommonInput, {
                  modelValue: passwordForm.value.currentPassword,
                  "onUpdate:modelValue": ($event) => passwordForm.value.currentPassword = $event,
                  type: "password",
                  label: unref($t)("profile.currentPassword"),
                  placeholder: unref($t)("profile.placeholders.currentPassword"),
                  error: passwordErrors.value.currentPassword,
                  required: ""
                }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "placeholder", "error"]),
                createVNode(_component_CommonInput, {
                  modelValue: passwordForm.value.newPassword,
                  "onUpdate:modelValue": ($event) => passwordForm.value.newPassword = $event,
                  type: "password",
                  label: unref($t)("profile.newPassword"),
                  placeholder: unref($t)("profile.placeholders.newPassword"),
                  error: passwordErrors.value.newPassword,
                  required: "",
                  onBlur: validateNewPassword
                }, {
                  hint: withCtx(() => [
                    createVNode("p", { class: "text-xs text-gray-500 dark:text-gray-400 mt-1" }, toDisplayString(unref($t)("profile.passwordHint")), 1)
                  ]),
                  _: 1
                }, 8, ["modelValue", "onUpdate:modelValue", "label", "placeholder", "error"]),
                createVNode(_component_CommonInput, {
                  modelValue: passwordForm.value.confirmPassword,
                  "onUpdate:modelValue": ($event) => passwordForm.value.confirmPassword = $event,
                  type: "password",
                  label: unref($t)("profile.newPasswordConfirm"),
                  placeholder: unref($t)("profile.placeholders.newPasswordConfirm"),
                  error: passwordErrors.value.confirmPassword,
                  required: "",
                  onBlur: validatePasswordConfirm
                }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "placeholder", "error"]),
                passwordError.value ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                }, [
                  createVNode("p", { class: "text-sm text-red-600 dark:text-red-400" }, toDisplayString(passwordError.value), 1)
                ])) : createCommentVNode("", true),
                createVNode("div", { class: "flex justify-end space-x-3 pt-4" }, [
                  createVNode(_component_CommonButton, {
                    type: "button",
                    variant: "secondary",
                    onClick: ($event) => showPasswordChange.value = false
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref($t)("common.cancel")), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick"]),
                  createVNode(_component_CommonButton, {
                    type: "submit",
                    loading: changingPassword.value,
                    disabled: !isPasswordFormValid.value || changingPassword.value
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref($t)("profile.change")), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "disabled"])
                ])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile/[username].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=_username_-CDj5tN4C.js.map
