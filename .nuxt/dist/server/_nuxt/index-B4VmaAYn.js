import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { _ as __nuxt_component_2 } from "./Button-BAc5buFc.js";
import { _ as _sfc_main$1 } from "./Input-CQRSLkRN.js";
import { _ as __nuxt_component_5 } from "./Select-BXAA3UYM.js";
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createBlock, createTextVNode, openBlock, createVNode, toDisplayString, createCommentVNode, Fragment, renderList, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { u as useI18n, a as useNuxtApp } from "../server.mjs";
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
const limit = 12;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    useHead({
      title: t("rules.pageTitle")
    });
    const searchQuery = ref("");
    const filters = ref({
      visibility: "all",
      sort: "updated"
    });
    const selectedTags = ref([]);
    const popularTags = ref(["eslint", "prettier", "typescript", "react", "vue", "nuxt", "tailwind"]);
    const rules = ref([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const total = ref(0);
    const totalPages = computed(() => Math.ceil(total.value / limit));
    const visiblePages = computed(() => {
      const pages = [];
      const start = Math.max(1, currentPage.value - 2);
      const end = Math.min(totalPages.value, start + 4);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    });
    const { $rpc } = useNuxtApp();
    const fetchRules = async () => {
      loading.value = true;
      try {
        const response = await $rpc.rules.search({
          limit,
          page: currentPage.value,
          sortBy: filters.value.sort,
          visibility: filters.value.visibility === "all" ? void 0 : filters.value.visibility,
          query: searchQuery.value || void 0,
          tags: selectedTags.value.length > 0 ? selectedTags.value : void 0
        });
        rules.value = response.rules.map((rule) => ({
          ...rule,
          tags: rule.tags || [],
          description: rule.description || ""
        }));
        total.value = response.total;
      } catch (error) {
        console.error("Failed to fetch rules:", error);
      } finally {
        loading.value = false;
      }
    };
    const { locale } = useI18n();
    const formatDate = (timestamp) => {
      return new Date(timestamp * 1e3).toLocaleDateString(locale.value === "ja" ? "ja-JP" : "en-US");
    };
    const getRuleUrl = (rule) => {
      if (rule.organization) {
        return `/rules/@${rule.organization.name}/${rule.name}`;
      }
      return `/rules/@${rule.author.username}/${rule.name}`;
    };
    let searchTimeout;
    const debouncedSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentPage.value = 1;
        fetchRules();
      }, 300);
    };
    watch(currentPage, fetchRules);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_CommonButton = __nuxt_component_2;
      const _component_CommonInput = _sfc_main$1;
      const _component_CommonSelect = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 dark:bg-gray-950" }, _attrs))} data-v-c12630cc><div class="container-lg py-8" data-v-c12630cc><div class="flex items-center justify-between mb-8" data-v-c12630cc><div class="stagger-item stagger-1" data-v-c12630cc><h1 class="heading-1 mb-2" data-v-c12630cc>${ssrInterpolate(_ctx.$t("rules.title"))}</h1><p class="text-gray-600 dark:text-gray-400" data-v-c12630cc>${ssrInterpolate(_ctx.$t("rules.subtitle"))}</p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/rules/new",
        class: "stagger-item stagger-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_CommonButton, {
              variant: "primary",
              class: "hover-lift"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c12630cc${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" data-v-c12630cc${_scopeId2}></path></svg> ${ssrInterpolate(_ctx.$t("rules.createRule"))}`);
                } else {
                  return [
                    (openBlock(), createBlock("svg", {
                      class: "w-5 h-5 mr-2",
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
                variant: "primary",
                class: "hover-lift"
              }, {
                default: withCtx(() => [
                  (openBlock(), createBlock("svg", {
                    class: "w-5 h-5 mr-2",
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
      _push(`</div><div class="space-y-6 mb-8 stagger-item stagger-3" data-v-c12630cc><div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center" data-v-c12630cc><div class="flex-1 relative group" data-v-c12630cc>`);
      _push(ssrRenderComponent(_component_CommonInput, {
        modelValue: searchQuery.value,
        "onUpdate:modelValue": ($event) => searchQuery.value = $event,
        placeholder: _ctx.$t("rules.searchPlaceholder"),
        onInput: debouncedSearch,
        class: "transition-all duration-300 focus-within:scale-[1.02] focus-within:shadow-lg"
      }, {
        prefix: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c12630cc${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-v-c12630cc${_scopeId}></path></svg>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                class: "w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200",
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
      }, _parent));
      _push(`</div><div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto" data-v-c12630cc>`);
      _push(ssrRenderComponent(_component_CommonSelect, {
        modelValue: filters.value.visibility,
        "onUpdate:modelValue": ($event) => filters.value.visibility = $event,
        onChange: fetchRules,
        class: "sm:min-w-[200px] transition-all duration-200 hover:shadow-md focus:scale-[1.02]"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<option value="all" data-v-c12630cc${_scopeId}>${ssrInterpolate(_ctx.$t("rules.visibility.all"))}</option><option value="public" data-v-c12630cc${_scopeId}>${ssrInterpolate(_ctx.$t("rules.visibility.public"))}</option><option value="private" data-v-c12630cc${_scopeId}>${ssrInterpolate(_ctx.$t("rules.visibility.private"))}</option><option value="organization" data-v-c12630cc${_scopeId}>${ssrInterpolate(_ctx.$t("rules.visibility.organization"))}</option>`);
          } else {
            return [
              createVNode("option", { value: "all" }, toDisplayString(_ctx.$t("rules.visibility.all")), 1),
              createVNode("option", { value: "public" }, toDisplayString(_ctx.$t("rules.visibility.public")), 1),
              createVNode("option", { value: "private" }, toDisplayString(_ctx.$t("rules.visibility.private")), 1),
              createVNode("option", { value: "organization" }, toDisplayString(_ctx.$t("rules.visibility.organization")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_CommonSelect, {
        modelValue: filters.value.sort,
        "onUpdate:modelValue": ($event) => filters.value.sort = $event,
        onChange: fetchRules,
        class: "sm:min-w-[200px] transition-all duration-200 hover:shadow-md focus:scale-[1.02]"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<option value="updated" data-v-c12630cc${_scopeId}>${ssrInterpolate(_ctx.$t("rules.sort.recentlyUpdated"))}</option><option value="created" data-v-c12630cc${_scopeId}>${ssrInterpolate(_ctx.$t("rules.sort.recentlyCreated"))}</option><option value="name" data-v-c12630cc${_scopeId}>${ssrInterpolate(_ctx.$t("rules.sort.alphabetical"))}</option>`);
          } else {
            return [
              createVNode("option", { value: "updated" }, toDisplayString(_ctx.$t("rules.sort.recentlyUpdated")), 1),
              createVNode("option", { value: "created" }, toDisplayString(_ctx.$t("rules.sort.recentlyCreated")), 1),
              createVNode("option", { value: "name" }, toDisplayString(_ctx.$t("rules.sort.alphabetical")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (popularTags.value.length > 0) {
        _push(`<div class="flex flex-wrap items-center gap-2 stagger-item stagger-4" data-v-c12630cc><span class="text-sm text-gray-600 dark:text-gray-400" data-v-c12630cc>${ssrInterpolate(_ctx.$t("rules.popularTags"))}</span><!--[-->`);
        ssrRenderList(popularTags.value, (tag) => {
          _push(`<button class="${ssrRenderClass([
            "px-3 py-1 rounded-full text-sm transition-colors",
            selectedTags.value.includes(tag) ? "bg-primary-500 text-white hover:bg-primary-600" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          ])}" data-v-c12630cc>${ssrInterpolate(tag)}</button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (loading.value) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-v-c12630cc><!--[-->`);
        ssrRenderList(6, (i) => {
          _push(`<div class="card" data-v-c12630cc><div class="skeleton h-6 w-3/4 mb-3" data-v-c12630cc></div><div class="skeleton h-4 w-1/2 mb-4" data-v-c12630cc></div><div class="skeleton h-4 w-full mb-2" data-v-c12630cc></div><div class="skeleton h-4 w-2/3" data-v-c12630cc></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (rules.value.length > 0) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-item stagger-5" data-v-c12630cc><!--[-->`);
        ssrRenderList(rules.value, (rule, index2) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: rule.id,
            to: getRuleUrl(rule),
            class: ["card-hover group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-2xl stagger-item", `stagger-${Math.min(index2 + 6, 8)}`]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-start justify-between mb-3" data-v-c12630cc${_scopeId}><div class="flex-1 min-w-0" data-v-c12630cc${_scopeId}><h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" data-v-c12630cc${_scopeId}>${ssrInterpolate(rule.name)}</h3><p class="text-sm text-gray-600 dark:text-gray-400 mt-1" data-v-c12630cc${_scopeId}> by ${ssrInterpolate(rule.organization ? "@" + rule.organization.name : rule.author.username)}</p></div><span class="${ssrRenderClass([
                  "ml-2 px-2 py-1 text-xs rounded-full",
                  rule.visibility === "public" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : rule.visibility === "private" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                ])}" data-v-c12630cc${_scopeId}>${ssrInterpolate(_ctx.$t(`rules.visibility.${rule.visibility}`))}</span></div>`);
                if (rule.description) {
                  _push2(`<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3" data-v-c12630cc${_scopeId}>${ssrInterpolate(rule.description)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                if (rule.tags && rule.tags.length > 0) {
                  _push2(`<div class="flex flex-wrap gap-1 mb-4" data-v-c12630cc${_scopeId}><!--[-->`);
                  ssrRenderList(rule.tags, (tag) => {
                    _push2(`<span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded" data-v-c12630cc${_scopeId}>${ssrInterpolate(tag)}</span>`);
                  });
                  _push2(`<!--]--></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400" data-v-c12630cc${_scopeId}><span data-v-c12630cc${_scopeId}>v${ssrInterpolate(rule.version)}</span><span data-v-c12630cc${_scopeId}>${ssrInterpolate(formatDate(rule.updated_at))}</span></div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-start justify-between mb-3" }, [
                    createVNode("div", { class: "flex-1 min-w-0" }, [
                      createVNode("h3", { class: "text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" }, toDisplayString(rule.name), 1),
                      createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-400 mt-1" }, " by " + toDisplayString(rule.organization ? "@" + rule.organization.name : rule.author.username), 1)
                    ]),
                    createVNode("span", {
                      class: [
                        "ml-2 px-2 py-1 text-xs rounded-full",
                        rule.visibility === "public" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : rule.visibility === "private" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      ]
                    }, toDisplayString(_ctx.$t(`rules.visibility.${rule.visibility}`)), 3)
                  ]),
                  rule.description ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3"
                  }, toDisplayString(rule.description), 1)) : createCommentVNode("", true),
                  rule.tags && rule.tags.length > 0 ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "flex flex-wrap gap-1 mb-4"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(rule.tags, (tag) => {
                      return openBlock(), createBlock("span", {
                        key: tag,
                        class: "px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded"
                      }, toDisplayString(tag), 1);
                    }), 128))
                  ])) : createCommentVNode("", true),
                  createVNode("div", { class: "flex items-center justify-between text-sm text-gray-600 dark:text-gray-400" }, [
                    createVNode("span", null, "v" + toDisplayString(rule.version), 1),
                    createVNode("span", null, toDisplayString(formatDate(rule.updated_at)), 1)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="text-center py-12" data-v-c12630cc><svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c12630cc><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-c12630cc></path></svg><h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2" data-v-c12630cc>${ssrInterpolate(_ctx.$t("rules.noRulesFound"))}</h3><p class="text-gray-600 dark:text-gray-400 mb-6" data-v-c12630cc>${ssrInterpolate(_ctx.$t("rules.createFirstRule"))}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/rules/new" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, { variant: "primary" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(_ctx.$t("rules.createRule"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(_ctx.$t("rules.createRule")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_CommonButton, { variant: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(_ctx.$t("rules.createRule")), 1)
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
      if (totalPages.value > 1) {
        _push(`<div class="mt-8 flex justify-center" data-v-c12630cc><nav class="flex items-center space-x-1" data-v-c12630cc><button${ssrIncludeBooleanAttr(currentPage.value === 1) ? " disabled" : ""} class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" data-v-c12630cc><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c12630cc><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" data-v-c12630cc></path></svg></button><!--[-->`);
        ssrRenderList(visiblePages.value, (page) => {
          _push(`<button class="${ssrRenderClass([
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            page === currentPage.value ? "bg-primary-500 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          ])}" data-v-c12630cc>${ssrInterpolate(page)}</button>`);
        });
        _push(`<!--]--><button${ssrIncludeBooleanAttr(currentPage.value === totalPages.value) ? " disabled" : ""} class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" data-v-c12630cc><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c12630cc><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-c12630cc></path></svg></button></nav></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/rules/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c12630cc"]]);
export {
  index as default
};
//# sourceMappingURL=index-B4VmaAYn.js.map
