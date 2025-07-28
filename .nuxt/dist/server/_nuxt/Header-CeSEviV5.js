import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext, withCtx, createVNode, createTextVNode, toDisplayString, createBlock, openBlock, resolveDynamicComponent, withKeys } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderComponent, ssrRenderVNode } from "vue/server-renderer";
import { u as useI18n, h as useSettingsStore, i as useThemeStore, n as navigateTo } from "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import { _ as __nuxt_component_2 } from "./Button-BAc5buFc.js";
import { _ as __nuxt_component_3 } from "./Modal-DWgkDmQ5.js";
import { _ as _sfc_main$2 } from "./Input-CQRSLkRN.js";
import { storeToRefs } from "pinia";
import { u as useAuthStore } from "./auth-DJ_gFT6B.js";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "LanguageSwitcher",
  __ssrInlineRender: true,
  setup(__props) {
    const { locale, availableLocales, setLocale } = useI18n();
    const settingsStore = useSettingsStore();
    const isOpen = ref(false);
    const isInitialized = ref(false);
    const currentLocaleName = computed(() => {
      if (!availableLocales.value || !Array.isArray(availableLocales.value)) {
        return locale.value || "ja";
      }
      const current = availableLocales.value.find((loc) => loc.code === locale.value);
      return (current == null ? void 0 : current.name) || locale.value;
    });
    watch(locale, (newLocale) => {
      if (isInitialized.value && newLocale !== settingsStore.language) {
        settingsStore.setLanguage(newLocale);
      }
    });
    watch(
      () => settingsStore.language,
      (newLanguage) => {
        if (isInitialized.value && newLanguage !== locale.value) {
          setLocale(newLanguage);
        }
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))} data-v-2dafec0f><button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 active:scale-95"${ssrRenderAttr("aria-label", _ctx.$t("accessibility.changeLanguage"))} data-v-2dafec0f><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-2dafec0f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" data-v-2dafec0f></path></svg><span class="hidden sm:inline" data-v-2dafec0f>${ssrInterpolate(currentLocaleName.value)}</span><svg class="${ssrRenderClass([{ "rotate-180": isOpen.value }, "w-4 h-4 transition-transform duration-300"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-2dafec0f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-2dafec0f></path></svg></button>`);
      if (isOpen.value) {
        _push(`<div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 py-1 z-50" data-v-2dafec0f><!--[-->`);
        ssrRenderList(unref(availableLocales), (localeItem) => {
          _push(`<button class="${ssrRenderClass([{
            "text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-950/20": localeItem.code === unref(settingsStore).language,
            "text-gray-700 dark:text-gray-300": localeItem.code !== unref(settingsStore).language
          }, "w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-between group hover:pl-5 active:scale-[0.98]"])}" data-v-2dafec0f><span data-v-2dafec0f>${ssrInterpolate(localeItem.name)}</span>`);
          if (localeItem.code === unref(settingsStore).language) {
            _push(`<svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20" data-v-2dafec0f><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" data-v-2dafec0f></path></svg>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/LanguageSwitcher.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-2dafec0f"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Header",
  __ssrInlineRender: true,
  setup(__props) {
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore);
    const showUserMenu = ref(false);
    const showMobileMenu = ref(false);
    const showSearch = ref(false);
    const showQuickAccess = ref(false);
    const searchQuery = ref("");
    const themeStore = useThemeStore();
    const { isDark } = storeToRefs(themeStore);
    const { t } = useI18n();
    const navigation = computed(() => {
      const items = [
        { name: t("nav.home"), href: "/" },
        { name: t("nav.rules"), href: "/rules" }
      ];
      if (user.value) {
        items.push({ name: t("nav.organizations"), href: "/organizations" });
      }
      return items;
    });
    const userMenuItems = computed(() => [
      {
        name: t("nav.profile"),
        href: authStore.user ? `/profile/${authStore.user.username}` : "/profile",
        icon: "svg"
        // TODO: Add proper icon component
      },
      {
        name: t("nav.settings"),
        href: "/settings",
        icon: "svg"
      },
      {
        name: t("settings.apiKeys"),
        href: "/api-keys",
        icon: "svg"
      }
    ]);
    const handleSearch = () => {
      if (searchQuery.value) {
        showSearch.value = false;
        navigateTo(`/rules?q=${encodeURIComponent(searchQuery.value)}`);
        searchQuery.value = "";
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_CommonLanguageSwitcher = __nuxt_component_1;
      const _component_CommonButton = __nuxt_component_2;
      const _component_CommonModal = __nuxt_component_3;
      const _component_CommonInput = _sfc_main$2;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800 animate-slideInDown" }, _attrs))}><div class="container-lg"><div class="flex items-center justify-between h-16"><div class="flex items-center">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center space-x-2"${_scopeId}><div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 transform"${_scopeId}><span class="text-white font-bold text-lg"${_scopeId}>Z</span></div><span class="text-2xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block transition-all duration-300 group-hover:translate-x-1"${_scopeId}> zxcv </span></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center space-x-2" }, [
                createVNode("div", { class: "w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 transform" }, [
                  createVNode("span", { class: "text-white font-bold text-lg" }, "Z")
                ]),
                createVNode("span", { class: "text-2xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block transition-all duration-300 group-hover:translate-x-1" }, " zxcv ")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="hidden md:ml-8 md:flex md:items-center md:space-x-1"><!--[-->`);
      ssrRenderList(navigation.value, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.name,
          to: item.href,
          class: "nav-link px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300 ease-out relative overflow-hidden group",
          "active-class": "bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(item.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(item.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav></div><div class="flex items-center space-x-2"><button class="nav-button p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 ease-out relative overflow-hidden group"><svg class="w-5 h-5 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button><button class="nav-button p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 ease-out relative overflow-hidden group">`);
      if (!unref(isDark)) {
        _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`);
      } else {
        _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`);
      }
      _push(`</button>`);
      _push(ssrRenderComponent(_component_CommonLanguageSwitcher, null, null, _parent));
      if (unref(user)) {
        _push(`<div class="flex items-center space-x-2"><div class="relative hidden md:block"><button class="nav-button flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 ease-out relative overflow-hidden group"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg><span>${ssrInterpolate(_ctx.$t("nav.myRules"))}</span><svg class="${ssrRenderClass([showQuickAccess.value ? "rotate-180" : "", "w-3 h-3 transition-transform duration-300 ease-out"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>`);
        if (showQuickAccess.value) {
          _push(`<div class="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 z-50"><div class="p-3"><h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">${ssrInterpolate(_ctx.$t("nav.quickAccess"))}</h3><div class="space-y-1">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/rules?author=${unref(user).username}`,
            onClick: ($event) => showQuickAccess.value = false,
            class: "flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"${_scopeId}></path></svg> ${ssrInterpolate(_ctx.$t("rules.myRules"))}`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    class: "w-4 h-4 mr-3",
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
                  ])),
                  createTextVNode(" " + toDisplayString(_ctx.$t("rules.myRules")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/organizations",
            onClick: ($event) => showQuickAccess.value = false,
            class: "flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-accent-50 dark:hover:bg-accent-950/20 hover:text-accent-600 dark:hover:text-accent-400 rounded-lg transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"${_scopeId}></path></svg> ${ssrInterpolate(_ctx.$t("nav.myOrganizations"))}`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    class: "w-4 h-4 mr-3",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    })
                  ])),
                  createTextVNode(" " + toDisplayString(_ctx.$t("nav.myOrganizations")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></div><div class="p-3">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/rules/new",
            onClick: ($event) => showQuickAccess.value = false
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_CommonButton, {
                  size: "sm",
                  variant: "primary",
                  class: "w-full justify-center hover-lift"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"${_scopeId2}></path></svg> ${ssrInterpolate(_ctx.$t("rules.createRule"))}`);
                    } else {
                      return [
                        (openBlock(), createBlock("svg", {
                          class: "w-4 h-4 mr-1.5",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: "M12 4v16m8-8H4"
                          })
                        ])),
                        createTextVNode(" " + toDisplayString(_ctx.$t("rules.createRule")), 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_CommonButton, {
                    size: "sm",
                    variant: "primary",
                    class: "w-full justify-center hover-lift"
                  }, {
                    default: withCtx(() => [
                      (openBlock(), createBlock("svg", {
                        class: "w-4 h-4 mr-1.5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M12 4v16m8-8H4"
                        })
                      ])),
                      createTextVNode(" " + toDisplayString(_ctx.$t("rules.createRule")), 1)
                    ]),
                    _: 1
                  })
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/rules/new",
          class: "md:hidden"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, {
                size: "sm",
                variant: "primary",
                class: "hover-lift",
                icon: ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"${_scopeId2}></path></svg>`);
                  } else {
                    return [
                      (openBlock(), createBlock("svg", {
                        class: "w-4 h-4",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M12 4v16m8-8H4"
                        })
                      ]))
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_CommonButton, {
                  size: "sm",
                  variant: "primary",
                  class: "hover-lift",
                  icon: ""
                }, {
                  default: withCtx(() => [
                    (openBlock(), createBlock("svg", {
                      class: "w-4 h-4",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M12 4v16m8-8H4"
                      })
                    ]))
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="relative"><button class="flex items-center space-x-2 p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all duration-200 group active:scale-95"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">${ssrInterpolate(unref(user).username[0].toUpperCase())}</div><svg class="${ssrRenderClass([showUserMenu.value ? "rotate-180" : "", "w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>`);
        if (showUserMenu.value) {
          _push(`<div class="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 animate-in"><div class="px-4 py-3"><p class="text-sm text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("auth.login.loggingIn"))}</p><p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">${ssrInterpolate(unref(user).email)}</p></div><div class="py-1"><!--[-->`);
          ssrRenderList(userMenuItems.value, (item) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: item.name,
              to: item.href,
              onClick: ($event) => showUserMenu.value = false,
              class: "flex items-center px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(item.icon), { class: "w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" }, null), _parent2, _scopeId);
                  _push2(` ${ssrInterpolate(item.name)}`);
                } else {
                  return [
                    (openBlock(), createBlock(resolveDynamicComponent(item.icon), { class: "w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" })),
                    createTextVNode(" " + toDisplayString(item.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div><div class="py-1"><button class="flex items-center w-full px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><svg class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg> ${ssrInterpolate(_ctx.$t("nav.logout"))}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div class="flex items-center space-x-2">`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/login" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, {
                variant: "ghost",
                size: "sm"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(_ctx.$t("nav.login"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(_ctx.$t("nav.login")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_CommonButton, {
                  variant: "ghost",
                  size: "sm"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(_ctx.$t("nav.login")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/register" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, {
                variant: "primary",
                size: "sm"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(_ctx.$t("nav.register"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(_ctx.$t("nav.register")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_CommonButton, {
                  variant: "primary",
                  size: "sm"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(_ctx.$t("nav.register")), 1)
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
      _push(`<button class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">`);
      if (!showMobileMenu.value) {
        _push(`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`);
      } else {
        _push(`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`);
      }
      _push(`</button></div></div></div>`);
      if (showMobileMenu.value) {
        _push(`<div class="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"><nav class="px-4 py-2 space-y-1"><!--[-->`);
        ssrRenderList(navigation.value, (item) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: item.name,
            to: item.href,
            onClick: ($event) => showMobileMenu.value = false,
            class: "block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            "active-class": "bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(item.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(item.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></nav></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_CommonModal, {
        modelValue: showSearch.value,
        "onUpdate:modelValue": ($event) => showSearch.value = $event,
        title: _ctx.$t("common.search"),
        size: "lg"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_CommonInput, {
              modelValue: searchQuery.value,
              "onUpdate:modelValue": ($event) => searchQuery.value = $event,
              placeholder: _ctx.$t("rules.searchPlaceholder"),
              onKeyup: handleSearch
            }, {
              prefix: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"${_scopeId2}></path></svg>`);
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
                        d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      })
                    ]))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_CommonInput, {
                modelValue: searchQuery.value,
                "onUpdate:modelValue": ($event) => searchQuery.value = $event,
                placeholder: _ctx.$t("rules.searchPlaceholder"),
                onKeyup: withKeys(handleSearch, ["enter"])
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
                      d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    })
                  ]))
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/Header.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=Header-CeSEviV5.js.map
