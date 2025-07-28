import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { defineComponent, ref, resolveComponent, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, withModifiers, Transition, createBlock, openBlock, withDirectives, vModelText, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from "vue/server-renderer";
import { a as useNuxtApp } from "../server.mjs";
import { u as useHead } from "./v3-CdJoEeaK.js";
import { u as useToast } from "./useToast-CcSWCLuS.js";
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
import "./toast-DzkE1rsh.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "forgotPassword",
  __ssrInlineRender: true,
  setup(__props) {
    const { $t } = useNuxtApp();
    useHead({
      title: $t("auth.forgotPassword.pageTitle")
    });
    const toast = useToast();
    const email = ref("");
    const loading = ref(false);
    const submitted = ref(false);
    const handleSubmit = async () => {
      loading.value = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        submitted.value = true;
        toast.success($t("auth.forgotPassword.success"));
      } catch (error) {
        console.error("Password reset error:", error);
        toast.error($t("auth.forgotPassword.error"));
      } finally {
        loading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Card = resolveComponent("Card");
      const _component_Button = resolveComponent("Button");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" }, _attrs))} data-v-c74fedf2><template><div class="sm:mx-auto sm:w-full sm:max-w-md" data-v-c74fedf2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex justify-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center logo-animation shadow-2xl" data-v-c74fedf2${_scopeId}><span class="text-2xl font-bold text-white" data-v-c74fedf2${_scopeId}>Z</span></div>`);
          } else {
            return [
              createVNode("div", { class: "w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center logo-animation shadow-2xl" }, [
                createVNode("span", { class: "text-2xl font-bold text-white" }, "Z")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white" data-v-c74fedf2>${ssrInterpolate(unref($t)("auth.forgotPassword.title"))}</h2><p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400" data-v-c74fedf2>${ssrInterpolate(unref($t)("common.or"))} `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/auth",
        class: "font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 hover-underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref($t)("auth.forgotPassword.backToLogin"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref($t)("auth.forgotPassword.backToLogin")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div></template><div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-v-c74fedf2>`);
      _push(ssrRenderComponent(_component_Card, {
        padding: "lg",
        class: "shadow-xl border-0 card-entrance"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form class="space-y-6" data-v-c74fedf2${_scopeId}>`);
            if (!submitted.value) {
              _push2(`<div data-v-c74fedf2${_scopeId}><div data-v-c74fedf2${_scopeId}><label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-c74fedf2${_scopeId}>${ssrInterpolate(unref($t)("auth.forgotPassword.email"))}</label><div class="mt-1" data-v-c74fedf2${_scopeId}><input id="email"${ssrRenderAttr("value", email.value)} name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm input-focus-transition" placeholder="example@example.com" data-v-c74fedf2${_scopeId}></div></div><div class="mt-6" data-v-c74fedf2${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Button, {
                type: "submit",
                variant: "primary",
                size: "lg",
                "full-width": "",
                loading: loading.value
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref($t)("auth.forgotPassword.sendButton"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref($t)("auth.forgotPassword.sendButton")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></div>`);
            } else {
              _push2(`<div class="text-center py-8" data-v-c74fedf2${_scopeId}><div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 success-bounce" data-v-c74fedf2${_scopeId}><svg class="h-6 w-6 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-c74fedf2${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" class="checkmark-draw" data-v-c74fedf2${_scopeId}></path></svg></div><h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white" data-v-c74fedf2${_scopeId}>${ssrInterpolate(unref($t)("auth.forgotPassword.emailSent"))}</h3><p class="mt-2 text-sm text-gray-600 dark:text-gray-400" data-v-c74fedf2${_scopeId}>${ssrInterpolate(unref($t)("auth.forgotPassword.emailSentMessage"))}</p><div class="mt-6" data-v-c74fedf2${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, { to: "/auth" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_Button, {
                      variant: "secondary",
                      size: "md"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(unref($t)("auth.forgotPassword.backToLogin"))}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(unref($t)("auth.forgotPassword.backToLogin")), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_Button, {
                        variant: "secondary",
                        size: "md"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref($t)("auth.forgotPassword.backToLogin")), 1)
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></div>`);
            }
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                class: "space-y-6",
                onSubmit: withModifiers(handleSubmit, ["prevent"])
              }, [
                createVNode(Transition, {
                  name: "fade-scale",
                  mode: "out-in"
                }, {
                  default: withCtx(() => [
                    !submitted.value ? (openBlock(), createBlock("div", { key: "form" }, [
                      createVNode("div", null, [
                        createVNode("label", {
                          for: "email",
                          class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                        }, toDisplayString(unref($t)("auth.forgotPassword.email")), 1),
                        createVNode("div", { class: "mt-1" }, [
                          withDirectives(createVNode("input", {
                            id: "email",
                            "onUpdate:modelValue": ($event) => email.value = $event,
                            name: "email",
                            type: "email",
                            autocomplete: "email",
                            required: "",
                            class: "appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm input-focus-transition",
                            placeholder: "example@example.com"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, email.value]
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "mt-6" }, [
                        createVNode(_component_Button, {
                          type: "submit",
                          variant: "primary",
                          size: "lg",
                          "full-width": "",
                          loading: loading.value
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref($t)("auth.forgotPassword.sendButton")), 1)
                          ]),
                          _: 1
                        }, 8, ["loading"])
                      ])
                    ])) : (openBlock(), createBlock("div", {
                      key: "success",
                      class: "text-center py-8"
                    }, [
                      createVNode("div", { class: "mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 success-bounce" }, [
                        (openBlock(), createBlock("svg", {
                          class: "h-6 w-6 text-green-600 dark:text-green-400",
                          xmlns: "http://www.w3.org/2000/svg",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: "M5 13l4 4L19 7",
                            class: "checkmark-draw"
                          })
                        ]))
                      ]),
                      createVNode("h3", { class: "mt-4 text-lg font-medium text-gray-900 dark:text-white" }, toDisplayString(unref($t)("auth.forgotPassword.emailSent")), 1),
                      createVNode("p", { class: "mt-2 text-sm text-gray-600 dark:text-gray-400" }, toDisplayString(unref($t)("auth.forgotPassword.emailSentMessage")), 1),
                      createVNode("div", { class: "mt-6" }, [
                        createVNode(_component_NuxtLink, { to: "/auth" }, {
                          default: withCtx(() => [
                            createVNode(_component_Button, {
                              variant: "secondary",
                              size: "md"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref($t)("auth.forgotPassword.backToLogin")), 1)
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ])
                    ]))
                  ]),
                  _: 1
                })
              ], 32)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/forgotPassword.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const forgotPassword = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c74fedf2"]]);
export {
  forgotPassword as default
};
//# sourceMappingURL=forgotPassword-CrR7OM9v.js.map
