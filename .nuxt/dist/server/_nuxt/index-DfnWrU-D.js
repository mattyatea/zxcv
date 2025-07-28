import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { _ as __nuxt_component_2 } from "./Button-BAc5buFc.js";
import { defineComponent, ref, mergeProps, withCtx, createBlock, createTextVNode, openBlock, createVNode, toDisplayString, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import { u as useToast } from "./useToast-CcSWCLuS.js";
import { u as useAuthStore } from "./auth-DJ_gFT6B.js";
import { u as useI18n, a as useNuxtApp } from "../server.mjs";
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useI18n();
    const loading = ref(false);
    const organizations = ref([]);
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore);
    const { error: toastError } = useToast();
    const { $rpc } = useNuxtApp();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_CommonButton = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 dark:bg-gray-950" }, _attrs))}><div class="container-lg py-8"><div class="flex items-center justify-between mb-8"><div><h1 class="heading-1 mb-2">${ssrInterpolate(_ctx.$t("organizations.title"))}</h1><p class="text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("organizations.subtitle"))}</p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/organizations/new" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_CommonButton, { variant: "primary" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"${_scopeId2}></path></svg> ${ssrInterpolate(_ctx.$t("organizations.createOrganization"))}`);
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
                    createTextVNode(" " + toDisplayString(_ctx.$t("organizations.createOrganization")), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_CommonButton, { variant: "primary" }, {
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
                  createTextVNode(" " + toDisplayString(_ctx.$t("organizations.createOrganization")), 1)
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (loading.value) {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><!--[-->`);
        ssrRenderList(6, (i) => {
          _push(`<div class="card"><div class="skeleton h-6 w-3/4 mb-3"></div><div class="skeleton h-4 w-full mb-2"></div><div class="skeleton h-4 w-2/3"></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (organizations.value.length === 0) {
        _push(`<div class="text-center py-12"><svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg><h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">${ssrInterpolate(_ctx.$t("organizations.noOrganizations"))}</h3><p class="text-gray-600 dark:text-gray-400 mb-6">${ssrInterpolate(_ctx.$t("organizations.createFirstOrganization"))}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/organizations/new" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, { variant: "primary" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(_ctx.$t("organizations.createOrganization"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(_ctx.$t("organizations.createOrganization")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_CommonButton, { variant: "primary" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(_ctx.$t("organizations.createOrganization")), 1)
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
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><!--[-->`);
        ssrRenderList(organizations.value, (organization) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: organization.id,
            to: `/organizations/${organization.id}`,
            class: "card-hover group"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-start justify-between mb-4"${_scopeId}><div class="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform"${_scopeId}>${ssrInterpolate(organization.name[0].toUpperCase())}</div><span class="badge badge-primary"${_scopeId}>${ssrInterpolate(organization.role)}</span></div><h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"${_scopeId}>${ssrInterpolate(organization.name)}</h3><p class="text-gray-600 dark:text-gray-400 text-sm mb-4"${_scopeId}>${ssrInterpolate(organization.description || _ctx.$t("organizations.noDescription"))}</p><div class="flex items-center justify-between text-sm"${_scopeId}><div class="flex items-center space-x-4"${_scopeId}><span class="flex items-center text-gray-600 dark:text-gray-400"${_scopeId}><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"${_scopeId}></path></svg> ${ssrInterpolate(organization.memberCount)} ${ssrInterpolate(_ctx.$t("organizations.members"))}</span><span class="flex items-center text-gray-600 dark:text-gray-400"${_scopeId}><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"${_scopeId}></path></svg> ${ssrInterpolate(organization.ruleCount)} ${ssrInterpolate(_ctx.$t("organizations.rules"))}</span></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-start justify-between mb-4" }, [
                    createVNode("div", { class: "w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform" }, toDisplayString(organization.name[0].toUpperCase()), 1),
                    createVNode("span", { class: "badge badge-primary" }, toDisplayString(organization.role), 1)
                  ]),
                  createVNode("h3", { class: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2" }, toDisplayString(organization.name), 1),
                  createVNode("p", { class: "text-gray-600 dark:text-gray-400 text-sm mb-4" }, toDisplayString(organization.description || _ctx.$t("organizations.noDescription")), 1),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("div", { class: "flex items-center space-x-4" }, [
                      createVNode("span", { class: "flex items-center text-gray-600 dark:text-gray-400" }, [
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
                            d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          })
                        ])),
                        createTextVNode(" " + toDisplayString(organization.memberCount) + " " + toDisplayString(_ctx.$t("organizations.members")), 1)
                      ]),
                      createVNode("span", { class: "flex items-center text-gray-600 dark:text-gray-400" }, [
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
                            d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          })
                        ])),
                        createTextVNode(" " + toDisplayString(organization.ruleCount) + " " + toDisplayString(_ctx.$t("organizations.rules")), 1)
                      ])
                    ])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/organizations/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-DfnWrU-D.js.map
