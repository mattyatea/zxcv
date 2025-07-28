import { _ as __nuxt_component_2 } from "./Button-BAc5buFc.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { _ as __nuxt_component_3 } from "./Modal-DWgkDmQ5.js";
import { _ as _sfc_main$2 } from "./Input-CQRSLkRN.js";
import { _ as _sfc_main$3 } from "./LoadingSpinner-DwDpbgSM.js";
import { defineComponent, computed, ref, watch, mergeProps, unref, isRef, withCtx, createTextVNode, toDisplayString, createVNode, withModifiers, createBlock, createCommentVNode, openBlock, Fragment, renderList, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttrs, ssrRenderClass, ssrRenderAttr } from "vue/server-renderer";
import { a as useNuxtApp, u as useI18n, b as useRoute } from "../server.mjs";
import { u as useToast } from "./useToast-CcSWCLuS.js";
import { u as useAuthStore } from "./auth-DJ_gFT6B.js";
import "./toast-DzkE1rsh.js";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
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
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function("return this")();
var Symbol$1 = root.Symbol;
var objectProto$1 = Object.prototype;
var hasOwnProperty = objectProto$1.hasOwnProperty;
var nativeObjectToString$1 = objectProto$1.toString;
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var objectProto = Object.prototype;
var nativeObjectToString = objectProto.toString;
function objectToString(value) {
  return nativeObjectToString.call(value);
}
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var symbolTag = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
}
var reWhitespace = /\s/;
function trimmedEndIndex(string) {
  var index = string.length;
  while (index-- && reWhitespace.test(string.charAt(index))) {
  }
  return index;
}
var reTrimStart = /^\s+/;
function baseTrim(string) {
  return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
}
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var now = function() {
  return root.Date.now();
};
var FUNC_ERROR_TEXT = "Expected a function";
var nativeMax = Math.max, nativeMin = Math.min;
function debounce(func, wait, options) {
  var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time) {
    var args = lastArgs, thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
    return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    if (timerId !== void 0) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result : trailingEdge(now());
  }
  function debounced() {
    var time = now(), isInvoking = shouldInvoke(time);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "InviteMemberModal",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean },
    organizationId: {}
  },
  emits: ["update:modelValue", "invited"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { $rpc } = useNuxtApp();
    const { t } = useI18n();
    const isOpen = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value)
    });
    const searchQuery = ref("");
    const searchResults = ref([]);
    const selectedUser = ref(null);
    const searching = ref(false);
    const inviting = ref(false);
    const error = ref("");
    const showSuggestions = ref(false);
    const searchUsers = async (query) => {
      if (!query || query.length < 1) {
        searchResults.value = [];
        return;
      }
      searching.value = true;
      error.value = "";
      try {
        const results = await $rpc.users.searchByUsername({
          username: query,
          limit: 10
        });
        searchResults.value = results;
        showSuggestions.value = true;
      } catch (err) {
        console.error("Failed to search users:", err);
        searchResults.value = [];
      } finally {
        searching.value = false;
      }
    };
    const handleSearch = debounce((event) => {
      const query = event.target.value;
      searchUsers(query);
    }, 300);
    const selectUser = (user) => {
      selectedUser.value = user;
      searchQuery.value = user.username;
      showSuggestions.value = false;
    };
    const handleSubmit = async () => {
      var _a, _b;
      if (!selectedUser.value) {
        return;
      }
      inviting.value = true;
      error.value = "";
      try {
        await $rpc.organizations.inviteMember({
          organizationId: props.organizationId,
          username: selectedUser.value.username
        });
        emit("invited", selectedUser.value);
        isOpen.value = false;
        const { showToast } = useToast();
        showToast({
          message: t("organizations.inviteMember.success", { username: selectedUser.value.username }),
          type: "success"
        });
      } catch (err) {
        console.error("Failed to invite member:", err);
        if (err instanceof Error && ((_a = err.message) == null ? void 0 : _a.includes("already a member"))) {
          error.value = t("organizations.inviteMember.alreadyMember");
        } else if (err instanceof Error && ((_b = err.message) == null ? void 0 : _b.includes("invitation has already been sent"))) {
          error.value = t("organizations.inviteMember.alreadyInvited");
        } else {
          error.value = t("organizations.inviteMember.error");
        }
      } finally {
        inviting.value = false;
      }
    };
    const handleCancel = () => {
      isOpen.value = false;
    };
    watch(isOpen, (newValue) => {
      if (!newValue) {
        searchQuery.value = "";
        searchResults.value = [];
        selectedUser.value = null;
        error.value = "";
        showSuggestions.value = false;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CommonModal = __nuxt_component_3;
      const _component_CommonInput = _sfc_main$2;
      const _component_CommonLoadingSpinner = _sfc_main$3;
      const _component_CommonButton = __nuxt_component_2;
      _push(ssrRenderComponent(_component_CommonModal, mergeProps({
        modelValue: unref(isOpen),
        "onUpdate:modelValue": ($event) => isRef(isOpen) ? isOpen.value = $event : null,
        title: _ctx.$t("organizations.inviteMember.title")
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form class="space-y-4"${_scopeId}><div class="relative"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: searchQuery.value,
              "onUpdate:modelValue": ($event) => searchQuery.value = $event,
              onInput: unref(handleSearch),
              label: _ctx.$t("organizations.inviteMember.usernameLabel"),
              placeholder: _ctx.$t("organizations.inviteMember.usernamePlaceholder"),
              autocomplete: "off"
            }, null, _parent2, _scopeId));
            if (showSuggestions.value && searchResults.value.length > 0) {
              _push2(`<div class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto"${_scopeId}><!--[-->`);
              ssrRenderList(searchResults.value, (user) => {
                _push2(`<button type="button" class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"${_scopeId}><div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-sm"${_scopeId}>${ssrInterpolate(user.username[0].toUpperCase())}</div><div class="flex-1 min-w-0"${_scopeId}><p class="text-sm font-medium text-gray-900 dark:text-gray-100"${_scopeId}>${ssrInterpolate(user.username)}</p><p class="text-xs text-gray-600 dark:text-gray-400 truncate"${_scopeId}>${ssrInterpolate(user.email)}</p></div></button>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (searching.value) {
              _push2(`<div class="absolute right-3 top-10"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_CommonLoadingSpinner, { size: "sm" }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (selectedUser.value) {
              _push2(`<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-between"${_scopeId}><div class="flex items-center gap-3"${_scopeId}><div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium"${_scopeId}>${ssrInterpolate(selectedUser.value.username[0].toUpperCase())}</div><div${_scopeId}><p class="font-medium text-gray-900 dark:text-gray-100"${_scopeId}>${ssrInterpolate(selectedUser.value.username)}</p><p class="text-sm text-gray-600 dark:text-gray-400"${_scopeId}>${ssrInterpolate(selectedUser.value.email)}</p></div></div><button type="button" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"${_scopeId}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"${_scopeId}></path></svg></button></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (error.value) {
              _push2(`<div class="text-sm text-red-600 dark:text-red-400"${_scopeId}>${ssrInterpolate(error.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="flex justify-end gap-3 pt-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_CommonButton, {
              type: "button",
              variant: "ghost",
              onClick: handleCancel,
              disabled: inviting.value
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(_ctx.$t("common.cancel"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_CommonButton, {
              type: "submit",
              disabled: !selectedUser.value || inviting.value,
              loading: inviting.value
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(_ctx.$t("organizations.inviteMember.invite"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(_ctx.$t("organizations.inviteMember.invite")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></form>`);
          } else {
            return [
              createVNode("form", {
                onSubmit: withModifiers(handleSubmit, ["prevent"]),
                class: "space-y-4"
              }, [
                createVNode("div", { class: "relative" }, [
                  createVNode(_component_CommonInput, {
                    modelValue: searchQuery.value,
                    "onUpdate:modelValue": ($event) => searchQuery.value = $event,
                    onInput: unref(handleSearch),
                    label: _ctx.$t("organizations.inviteMember.usernameLabel"),
                    placeholder: _ctx.$t("organizations.inviteMember.usernamePlaceholder"),
                    autocomplete: "off"
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "onInput", "label", "placeholder"]),
                  showSuggestions.value && searchResults.value.length > 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(searchResults.value, (user) => {
                      return openBlock(), createBlock("button", {
                        key: user.id,
                        type: "button",
                        onClick: ($event) => selectUser(user),
                        class: "w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                      }, [
                        createVNode("div", { class: "w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-sm" }, toDisplayString(user.username[0].toUpperCase()), 1),
                        createVNode("div", { class: "flex-1 min-w-0" }, [
                          createVNode("p", { class: "text-sm font-medium text-gray-900 dark:text-gray-100" }, toDisplayString(user.username), 1),
                          createVNode("p", { class: "text-xs text-gray-600 dark:text-gray-400 truncate" }, toDisplayString(user.email), 1)
                        ])
                      ], 8, ["onClick"]);
                    }), 128))
                  ])) : createCommentVNode("", true),
                  searching.value ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "absolute right-3 top-10"
                  }, [
                    createVNode(_component_CommonLoadingSpinner, { size: "sm" })
                  ])) : createCommentVNode("", true)
                ]),
                selectedUser.value ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-between"
                }, [
                  createVNode("div", { class: "flex items-center gap-3" }, [
                    createVNode("div", { class: "w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium" }, toDisplayString(selectedUser.value.username[0].toUpperCase()), 1),
                    createVNode("div", null, [
                      createVNode("p", { class: "font-medium text-gray-900 dark:text-gray-100" }, toDisplayString(selectedUser.value.username), 1),
                      createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-400" }, toDisplayString(selectedUser.value.email), 1)
                    ])
                  ]),
                  createVNode("button", {
                    type: "button",
                    onClick: ($event) => selectedUser.value = null,
                    class: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }, [
                    (openBlock(), createBlock("svg", {
                      class: "w-5 h-5",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M6 18L18 6M6 6l12 12"
                      })
                    ]))
                  ], 8, ["onClick"])
                ])) : createCommentVNode("", true),
                error.value ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "text-sm text-red-600 dark:text-red-400"
                }, toDisplayString(error.value), 1)) : createCommentVNode("", true),
                createVNode("div", { class: "flex justify-end gap-3 pt-4" }, [
                  createVNode(_component_CommonButton, {
                    type: "button",
                    variant: "ghost",
                    onClick: handleCancel,
                    disabled: inviting.value
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)
                    ]),
                    _: 1
                  }, 8, ["disabled"]),
                  createVNode(_component_CommonButton, {
                    type: "submit",
                    disabled: !selectedUser.value || inviting.value,
                    loading: inviting.value
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(_ctx.$t("organizations.inviteMember.invite")), 1)
                    ]),
                    _: 1
                  }, 8, ["disabled", "loading"])
                ])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/organizations/InviteMemberModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const route = useRoute();
    const { $rpc } = useNuxtApp();
    const authStore = useAuthStore();
    const loading = ref(false);
    const organization = ref(null);
    const rules = ref([]);
    const members = ref([]);
    const activeTab = ref("rules");
    const showInviteModal = ref(false);
    const tabs = [
      { id: "rules", label: t("organizations.detail.rules") },
      { id: "members", label: t("organizations.detail.members") }
    ];
    const fetchTabData = async (tab) => {
      const organizationId = route.params.id;
      try {
        if (tab === "rules" && rules.value.length === 0) {
          const rulesData = await $rpc.organizations.rules({ organizationId });
          rules.value = rulesData;
        } else if (tab === "members" && members.value.length === 0) {
          const membersData = await $rpc.organizations.members({ organizationId });
          members.value = membersData;
        }
      } catch (error) {
        console.error(`Failed to fetch ${tab}:`, error);
      }
    };
    const handleMemberInvited = (_user) => {
      if (activeTab.value === "members") {
        fetchTabData("members");
      }
    };
    watch(activeTab, (newTab) => {
      fetchTabData(newTab);
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_CommonButton = __nuxt_component_2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_OrganizationsInviteMemberModal = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 dark:bg-gray-950" }, _attrs))}><div class="container-lg py-8">`);
      if (loading.value) {
        _push(`<div class="space-y-6"><div class="skeleton h-10 w-1/3"></div><div class="skeleton h-6 w-2/3"></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-6"><div class="card"><div class="skeleton h-6 w-1/4 mb-4"></div><div class="space-y-2"><div class="skeleton h-4 w-full"></div><div class="skeleton h-4 w-3/4"></div></div></div></div></div></div>`);
      } else if (organization.value) {
        _push(`<div><div class="flex items-start justify-between mb-8"><div><div class="flex items-center gap-3 mb-2"><div class="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">${ssrInterpolate(organization.value.name[0].toUpperCase())}</div><div><h1 class="heading-1">${ssrInterpolate(organization.value.name)}</h1><p class="text-gray-600 dark:text-gray-400">${ssrInterpolate(organization.value.description || _ctx.$t("organizations.noDescription"))}</p></div></div></div><div class="flex items-center gap-2">`);
        if (organization.value.role === "owner") {
          _push(ssrRenderComponent(_component_CommonButton, {
            variant: "ghost",
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"${_scopeId}></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"${_scopeId}></path></svg> ${ssrInterpolate(_ctx.$t("organizations.detail.settings"))}`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    class: "w-4 h-4 mr-1",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    }),
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    })
                  ])),
                  createTextVNode(" " + toDisplayString(_ctx.$t("organizations.detail.settings")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (organization.value.role === "member") {
          _push(ssrRenderComponent(_component_CommonButton, {
            variant: "danger",
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(_ctx.$t("organizations.detail.leaveOrganization"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(_ctx.$t("organizations.detail.leaveOrganization")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"><div class="card"><div class="flex items-center justify-between"><div><p class="text-sm text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("organizations.detail.members"))}</p><p class="text-2xl font-bold text-gray-900 dark:text-gray-100">${ssrInterpolate(organization.value.memberCount)}</p></div><svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div></div><div class="card"><div class="flex items-center justify-between"><div><p class="text-sm text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("organizations.detail.rules"))}</p><p class="text-2xl font-bold text-gray-900 dark:text-gray-100">${ssrInterpolate(organization.value.ruleCount)}</p></div><svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div></div><div class="card"><div class="flex items-center justify-between"><div><p class="text-sm text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("organizations.detail.createdAt"))}</p><p class="text-lg font-medium text-gray-900 dark:text-gray-100">${ssrInterpolate(new Date(organization.value.createdAt).toLocaleDateString("ja-JP"))}</p></div><svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div></div></div><div class="border-b border-gray-200 dark:border-gray-800 mb-6"><nav class="flex space-x-8"><!--[-->`);
        ssrRenderList(tabs, (tab) => {
          _push(`<button class="${ssrRenderClass([
            "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
            activeTab.value === tab.id ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          ])}">${ssrInterpolate(tab.label)}</button>`);
        });
        _push(`<!--]--></nav></div>`);
        if (activeTab.value === "rules") {
          _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`);
          if (rules.value.length === 0) {
            _push(`<div class="col-span-full text-center py-12"><p class="text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("organizations.detail.noRules"))}</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(rules.value, (rule) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: rule.id,
              to: `/rules/@${organization.value.name}/${rule.name}`,
              class: "card-hover"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2"${_scopeId}>${ssrInterpolate(rule.name)}</h3><p class="text-sm text-gray-600 dark:text-gray-400 mb-4"${_scopeId}>${ssrInterpolate(rule.description)}</p><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-600 dark:text-gray-400"${_scopeId}>${ssrInterpolate(new Date(rule.updatedAt).toLocaleDateString("ja-JP"))}</span><span class="badge badge-primary"${_scopeId}> v${ssrInterpolate(rule.version)}</span></div>`);
                } else {
                  return [
                    createVNode("h3", { class: "font-semibold text-gray-900 dark:text-gray-100 mb-2" }, toDisplayString(rule.name), 1),
                    createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-400 mb-4" }, toDisplayString(rule.description), 1),
                    createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                      createVNode("span", { class: "text-gray-600 dark:text-gray-400" }, toDisplayString(new Date(rule.updatedAt).toLocaleDateString("ja-JP")), 1),
                      createVNode("span", { class: "badge badge-primary" }, " v" + toDisplayString(rule.version), 1)
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else if (activeTab.value === "members") {
          _push(`<div class="space-y-4"><!--[-->`);
          ssrRenderList(members.value, (member) => {
            var _a2;
            _push(`<div class="card flex items-center justify-between"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">${ssrInterpolate(member.username[0].toUpperCase())}</div><div><p class="font-medium text-gray-900 dark:text-gray-100">${ssrInterpolate(member.username)}</p><p class="text-sm text-gray-600 dark:text-gray-400">${ssrInterpolate(member.email)}</p></div></div><div class="flex items-center gap-2"><span class="${ssrRenderClass([member.role === "owner" ? "badge-primary" : "badge-gray", "badge"])}">${ssrInterpolate(member.role === "owner" ? _ctx.$t("organizations.owner") : _ctx.$t("organizations.member"))}</span>`);
            if (organization.value.role === "owner" && member.id !== ((_a2 = unref(authStore).user) == null ? void 0 : _a2.id) && member.role !== "owner") {
              _push(`<button class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"${ssrRenderAttr("title", _ctx.$t("organizations.detail.removeMember"))}><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]-->`);
          if (organization.value.role === "owner") {
            _push(`<div class="mt-6">`);
            _push(ssrRenderComponent(_component_CommonButton, {
              onClick: ($event) => showInviteModal.value = true,
              variant: "ghost",
              class: "w-full"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"${_scopeId}></path></svg> ${ssrInterpolate(_ctx.$t("organizations.detail.inviteMembers"))}`);
                } else {
                  return [
                    (openBlock(), createBlock("svg", {
                      class: "w-4 h-4 mr-2",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      })
                    ])),
                    createTextVNode(" " + toDisplayString(_ctx.$t("organizations.detail.inviteMembers")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="text-center py-12"><p class="text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("organizations.detail.notFound"))}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/organizations" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, {
                variant: "ghost",
                class: "mt-4"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(_ctx.$t("organizations.detail.backToList"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(_ctx.$t("organizations.detail.backToList")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_CommonButton, {
                  variant: "ghost",
                  class: "mt-4"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(_ctx.$t("organizations.detail.backToList")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_OrganizationsInviteMemberModal, {
        modelValue: showInviteModal.value,
        "onUpdate:modelValue": ($event) => showInviteModal.value = $event,
        "organization-id": ((_a = organization.value) == null ? void 0 : _a.id) || "",
        onInvited: handleMemberInvited
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/organizations/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=_id_-rzR6as6C.js.map
