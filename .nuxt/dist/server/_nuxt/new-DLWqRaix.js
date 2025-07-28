import { _ as _sfc_main$1 } from "./Input-CQRSLkRN.js";
import { _ as __nuxt_component_2 } from "./Button-BAc5buFc.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { defineComponent, ref, mergeProps, withCtx, createBlock, openBlock, createVNode, createTextVNode, toDisplayString, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import { u as useToast } from "./useToast-CcSWCLuS.js";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import { u as useI18n } from "../server.mjs";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
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
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "@orpc/client";
import "@orpc/client/fetch";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "new",
  __ssrInlineRender: true,
  setup(__props) {
    const form = ref({
      name: "",
      description: ""
    });
    useI18n();
    const inviteEmails = ref([""]);
    const errors = ref({});
    const submitting = ref(false);
    const { success: toastSuccess, error: toastError } = useToast();
    const addEmail = () => {
      inviteEmails.value.push("");
    };
    const removeEmail = (index) => {
      inviteEmails.value.splice(index, 1);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CommonInput = _sfc_main$1;
      const _component_CommonButton = __nuxt_component_2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 dark:bg-gray-950" }, _attrs))}><div class="container-sm py-8"><div class="mb-8"><h1 class="heading-1 mb-2">${ssrInterpolate(_ctx.$t("organizations.createNewTeam"))}</h1><p class="text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("organizations.inviteAndCollaborate"))}</p></div><form class="card max-w-2xl"><div class="space-y-6">`);
      _push(ssrRenderComponent(_component_CommonInput, {
        modelValue: form.value.name,
        "onUpdate:modelValue": ($event) => form.value.name = $event,
        label: _ctx.$t("organizations.form.name"),
        placeholder: _ctx.$t("organizations.form.namePlaceholder"),
        required: "",
        error: errors.value.name
      }, null, _parent));
      _push(`<div class="form-group"><label class="label">${ssrInterpolate(_ctx.$t("organizations.form.description"))}</label><textarea class="input min-h-[100px]"${ssrRenderAttr("placeholder", _ctx.$t("organizations.form.descriptionPlaceholder"))} rows="4">${ssrInterpolate(form.value.description)}</textarea></div><div class="form-group"><label class="label">${ssrInterpolate(_ctx.$t("organizations.form.inviteMembers"))}</label><div class="space-y-2"><!--[-->`);
      ssrRenderList(inviteEmails.value, (email, index) => {
        _push(`<div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_CommonInput, {
          modelValue: inviteEmails.value[index],
          "onUpdate:modelValue": ($event) => inviteEmails.value[index] = $event,
          type: "email",
          placeholder: "email@example.com",
          error: errors.value[`email_${index}`]
        }, null, _parent));
        if (inviteEmails.value.length > 1) {
          _push(ssrRenderComponent(_component_CommonButton, {
            onClick: ($event) => removeEmail(index),
            variant: "ghost",
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"${_scopeId}></path></svg>`);
              } else {
                return [
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
                      d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    })
                  ]))
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_CommonButton, {
        onClick: addEmail,
        variant: "ghost",
        size: "sm",
        type: "button"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"${_scopeId}></path></svg> ${ssrInterpolate(_ctx.$t("organizations.form.addMember"))}`);
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
                  d: "M12 4v16m8-8H4"
                })
              ])),
              createTextVNode(" " + toDisplayString(_ctx.$t("organizations.form.addMember")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div><div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/organizations" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_CommonButton, { variant: "ghost" }, {
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
          } else {
            return [
              createVNode(_component_CommonButton, { variant: "ghost" }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_CommonButton, {
        type: "submit",
        variant: "primary",
        loading: submitting.value
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("organizations.createTeam"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("organizations.createTeam")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></form></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/organizations/new.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=new-DLWqRaix.js.map
