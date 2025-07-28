import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { _ as __nuxt_component_2 } from "./Button-BAc5buFc.js";
import { _ as __nuxt_component_3 } from "./Modal-DWgkDmQ5.js";
import { defineComponent, ref, inject, computed, mergeProps, withCtx, createBlock, createTextVNode, openBlock, createVNode, toDisplayString, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import { storeToRefs } from "pinia";
import { u as useToast } from "./useToast-CcSWCLuS.js";
import { u as useAuthStore } from "./auth-DJ_gFT6B.js";
import { b as useRoute, a as useNuxtApp, u as useI18n, c as useRouter } from "../server.mjs";
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
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { $rpc } = useNuxtApp();
    const { t } = useI18n();
    const router = useRouter();
    const loading = ref(false);
    const rule = ref(null);
    const versions = ref([]);
    const relatedRules = ref([]);
    const isOwner = ref(false);
    const copied = ref(false);
    const originalVersion = ref("");
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore);
    const { success: toastSuccess, error: toastError } = useToast();
    const showDeleteModal = ref(false);
    const deleting = ref(false);
    const customParams = inject("customRouteParams", null);
    const owner = computed(() => (customParams == null ? void 0 : customParams.owner) || route.params.owner);
    const name = computed(() => (customParams == null ? void 0 : customParams.name) || route.params.name);
    const fetchRuleDetails = async () => {
      var _a;
      loading.value = true;
      try {
        const path = `@${owner.value}/${name.value}`;
        const data = await $rpc.rules.getByPath({ path });
        const contentData = await $rpc.rules.getContent({ id: data.id });
        rule.value = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          content: contentData.content,
          visibility: data.visibility,
          author: data.author,
          organization: data.organization,
          tags: data.tags || [],
          version: data.version,
          updated_at: typeof data.updated_at === "number" ? data.updated_at : Math.floor(new Date(data.updated_at).getTime() / 1e3)
        };
        if (((_a = user.value) == null ? void 0 : _a.id) === data.author.id) {
          isOwner.value = true;
        } else if (data.organization) {
          try {
            const organizations = await $rpc.organizations.list();
            const isOrgOwner = organizations.some(
              (org) => {
                var _a2, _b;
                return org.id === ((_a2 = data.organization) == null ? void 0 : _a2.id) && org.owner.id === ((_b = user.value) == null ? void 0 : _b.id);
              }
            );
            isOwner.value = isOrgOwner;
          } catch (error) {
            console.error("Failed to check organization ownership:", error);
            isOwner.value = false;
          }
        } else {
          isOwner.value = false;
        }
        originalVersion.value = data.version;
        try {
          const versionsData = await $rpc.rules.versions({ id: data.id });
          versions.value = versionsData;
        } catch (error) {
          console.error("Failed to fetch versions:", error);
        }
        try {
          const relatedData = await $rpc.rules.related({ id: data.id });
          relatedRules.value = relatedData;
        } catch (error) {
          console.error("Failed to fetch related rules:", error);
        }
      } catch (error) {
        console.error("Failed to fetch rule details:", error);
        rule.value = null;
      } finally {
        loading.value = false;
      }
    };
    const { locale } = useI18n();
    const formatDate = (timestamp) => {
      return new Date(timestamp * 1e3).toLocaleDateString(locale.value === "ja" ? "ja-JP" : "en-US");
    };
    const copyRule = async () => {
      if (!rule.value) {
        return;
      }
      try {
        await (void 0).clipboard.writeText(rule.value.content);
        copied.value = true;
        toastSuccess(t("rules.messages.copied"));
        setTimeout(() => {
          copied.value = false;
        }, 2e3);
      } catch (error) {
        console.error("Failed to copy:", error);
        toastError(t("rules.messages.copyError"));
      }
    };
    const copyContent = async () => {
      if (!rule.value) {
        return;
      }
      try {
        await (void 0).clipboard.writeText(rule.value.content);
        toastSuccess(t("rules.messages.contentCopied"));
      } catch (error) {
        console.error("Failed to copy content:", error);
        toastError(t("rules.messages.copyError"));
      }
    };
    const getRuleUrl = (rule2) => {
      if (rule2.organization) {
        return `/rules/@${rule2.organization.name}/${rule2.name}`;
      }
      return `/rules/@${rule2.author.username}/${rule2.name}`;
    };
    const deleteRule = async () => {
      if (!rule.value) {
        return;
      }
      deleting.value = true;
      try {
        await $rpc.rules.delete({ id: rule.value.id });
        showDeleteModal.value = false;
        toastSuccess(t("rules.messages.deleted"));
        await router.push("/rules");
      } catch (error) {
        console.error("Failed to delete rule:", error);
        toastError(t("rules.messages.deleteError"));
      } finally {
        deleting.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_CommonButton = __nuxt_component_2;
      const _component_CommonModal = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 dark:bg-gray-950" }, _attrs))}><div class="container-lg py-8">`);
      if (loading.value) {
        _push(`<div class="max-w-4xl mx-auto"><div class="skeleton h-10 w-2/3 mb-4"></div><div class="skeleton h-6 w-1/3 mb-8"></div><div class="card"><div class="skeleton h-4 w-full mb-2"></div><div class="skeleton h-4 w-3/4 mb-2"></div><div class="skeleton h-4 w-1/2"></div></div></div>`);
      } else if (rule.value) {
        _push(`<div class="max-w-4xl mx-auto"><div class="mb-8"><div class="flex items-start justify-between gap-4"><div><h1 class="heading-1 mb-3">${ssrInterpolate(rule.value.name)}</h1><div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400"><span class="flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> ${ssrInterpolate(rule.value.author.username)}</span><span>v${ssrInterpolate(rule.value.version)}</span><span>${ssrInterpolate(formatDate(rule.value.updated_at))}</span><span class="${ssrRenderClass([
          "px-2 py-1 text-xs rounded-full",
          rule.value.visibility === "public" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : rule.value.visibility === "private" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        ])}">${ssrInterpolate(_ctx.$t(`rules.visibility.${rule.value.visibility}`))}</span></div></div><div class="flex items-center gap-2">`);
        if (isOwner.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/rules/@${owner.value}/${name.value}/edit`
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_CommonButton, {
                  variant: "ghost",
                  size: "sm"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"${_scopeId2}></path></svg> ${ssrInterpolate(_ctx.$t("rules.actions.edit"))}`);
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
                            d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          })
                        ])),
                        createTextVNode(" " + toDisplayString(_ctx.$t("rules.actions.edit")), 1)
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
                          d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        })
                      ])),
                      createTextVNode(" " + toDisplayString(_ctx.$t("rules.actions.edit")), 1)
                    ]),
                    _: 1
                  })
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (isOwner.value) {
          _push(ssrRenderComponent(_component_CommonButton, {
            variant: "danger",
            size: "sm",
            onClick: ($event) => showDeleteModal.value = true
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"${_scopeId}></path></svg> ${ssrInterpolate(_ctx.$t("rules.actions.delete"))}`);
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
                      d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    })
                  ])),
                  createTextVNode(" " + toDisplayString(_ctx.$t("rules.actions.delete")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_CommonButton, {
          variant: "primary",
          size: "sm",
          onClick: copyRule
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"${_scopeId}></path></svg> ${ssrInterpolate(copied.value ? _ctx.$t("rules.actions.copied") : _ctx.$t("rules.actions.copyRule"))}`);
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
                    d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  })
                ])),
                createTextVNode(" " + toDisplayString(copied.value ? _ctx.$t("rules.actions.copied") : _ctx.$t("rules.actions.copyRule")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
        if (rule.value.description) {
          _push(`<div class="card mb-6"><h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">${ssrInterpolate(_ctx.$t("rules.form.description"))}</h2><p class="text-gray-600 dark:text-gray-400">${ssrInterpolate(rule.value.description)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (rule.value.tags && rule.value.tags.length > 0) {
          _push(`<div class="mb-6"><div class="flex items-center gap-2"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg><div class="flex flex-wrap gap-2"><!--[-->`);
          ssrRenderList(rule.value.tags, (tag) => {
            _push(`<span class="px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full">${ssrInterpolate(tag)}</span>`);
          });
          _push(`<!--]--></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (rule.value.version !== originalVersion.value) {
          _push(`<div class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"><div class="flex items-center justify-between"><p class="text-sm text-yellow-800 dark:text-yellow-200">${ssrInterpolate(_ctx.$t("rules.detail.viewingOldVersion", { version: `v${rule.value.version}` }))}</p>`);
          _push(ssrRenderComponent(_component_CommonButton, {
            size: "sm",
            variant: "primary",
            onClick: fetchRuleDetails
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(_ctx.$t("rules.detail.viewLatestVersion"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(_ctx.$t("rules.detail.viewLatestVersion")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="card mb-6"><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">${ssrInterpolate(_ctx.$t("rules.ruleContent"))}</h2>`);
        _push(ssrRenderComponent(_component_CommonButton, {
          variant: "ghost",
          size: "xs",
          onClick: copyContent
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"${_scopeId}></path></svg>`);
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
                    d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  })
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="relative"><pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>${ssrInterpolate(rule.value.content)}</code></pre></div></div><div class="card"><h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">${ssrInterpolate(_ctx.$t("rules.detail.versionHistory"))}</h2><div class="space-y-3"><!--[-->`);
        ssrRenderList(versions.value, (version) => {
          _push(`<div class="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"><div class="flex-1"><span class="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"> v${ssrInterpolate(version.version)} `);
          if (version.version === originalVersion.value) {
            _push(`<span class="ml-2 text-xs text-green-600 dark:text-green-400"> (${ssrInterpolate(_ctx.$t("rules.detail.latest"))}) </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span><span class="text-sm text-gray-600 dark:text-gray-400 ml-3">${ssrInterpolate(version.changelog)}</span></div><div class="flex items-center gap-3"><span class="text-sm text-gray-600 dark:text-gray-400">${ssrInterpolate(formatDate(version.created_at))}</span>`);
          if (version.version === rule.value.version) {
            _push(`<span class="text-xs text-blue-600 dark:text-blue-400 font-medium">${ssrInterpolate(_ctx.$t("rules.detail.currentlyViewing"))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div>`);
        if (relatedRules.value.length > 0) {
          _push(`<div class="mt-8"><h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">${ssrInterpolate(_ctx.$t("rules.detail.relatedRules"))}</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><!--[-->`);
          ssrRenderList(relatedRules.value, (related) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: related.id,
              to: getRuleUrl(related),
              class: "card-hover"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<h3 class="font-medium text-gray-900 dark:text-gray-100 mb-1"${_scopeId}>${ssrInterpolate(related.name)}</h3><p class="text-sm text-gray-600 dark:text-gray-400"${_scopeId}>by ${ssrInterpolate(related.organization ? "@" + related.organization.name : related.author.username)}</p>`);
                } else {
                  return [
                    createVNode("h3", { class: "font-medium text-gray-900 dark:text-gray-100 mb-1" }, toDisplayString(related.name), 1),
                    createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-400" }, "by " + toDisplayString(related.organization ? "@" + related.organization.name : related.author.username), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="text-center py-12"><p class="text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("rules.detail.notFound"))}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/rules" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, {
                variant: "ghost",
                class: "mt-4"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(_ctx.$t("rules.detail.backToList"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(_ctx.$t("rules.detail.backToList")), 1)
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
                    createTextVNode(toDisplayString(_ctx.$t("rules.detail.backToList")), 1)
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
      _push(ssrRenderComponent(_component_CommonModal, {
        modelValue: showDeleteModal.value,
        "onUpdate:modelValue": ($event) => showDeleteModal.value = $event,
        title: _ctx.$t("rules.messages.deleteConfirm"),
        size: "sm"
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_CommonButton, {
              variant: "ghost",
              onClick: ($event) => showDeleteModal.value = false
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
              variant: "danger",
              onClick: deleteRule,
              loading: deleting.value
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(_ctx.$t("common.delete"))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(_ctx.$t("common.delete")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_CommonButton, {
                variant: "ghost",
                onClick: ($event) => showDeleteModal.value = false
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(_component_CommonButton, {
                variant: "danger",
                onClick: deleteRule,
                loading: deleting.value
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(_ctx.$t("common.delete")), 1)
                ]),
                _: 1
              }, 8, ["loading"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p class="text-gray-600 dark:text-gray-400"${_scopeId}>${ssrInterpolate(_ctx.$t("rules.messages.deleteConfirm"))}</p>`);
          } else {
            return [
              createVNode("p", { class: "text-gray-600 dark:text-gray-400" }, toDisplayString(_ctx.$t("rules.messages.deleteConfirm")), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/rules/@[owner]/[name]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-BhpPATai.js.map
