import { ref, resolveComponent, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import "./auth-DJ_gFT6B.js";
import { u as useI18n, a as useNuxtApp } from "../server.mjs";
import { u as useHead } from "./v3-CdJoEeaK.js";
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
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
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
const _sfc_main = {
  __name: "new",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    useHead({
      title: t("rules.newRuleTitle")
    });
    const form = ref({
      name: "",
      org: "",
      description: "",
      visibility: "public",
      organizationId: "",
      tags: [],
      content: ""
    });
    const tagInput = ref("");
    const organizations = ref([]);
    const loading = ref(false);
    const error = ref("");
    const selectedOrganizationId = ref("");
    const showFileUpload = ref(false);
    const addTag = () => {
      const tag = tagInput.value.trim().toLowerCase();
      if (tag && !form.value.tags.includes(tag)) {
        form.value.tags.push(tag);
        tagInput.value = "";
      }
    };
    const { $rpc } = useNuxtApp();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = resolveComponent("Button");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" }, _attrs))}><div class="mb-8"><h1 class="text-3xl font-bold text-gray-900 dark:text-white">${ssrInterpolate(_ctx.$t("rules.createNewRule"))}</h1><p class="mt-2 text-sm text-gray-600 dark:text-gray-400">${ssrInterpolate(_ctx.$t("rules.shareWithCommunity"))}</p></div><form class="space-y-6"><div class="card"><h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">${ssrInterpolate(_ctx.$t("rules.basicInfo"))}</h2><div class="space-y-4"><div><label for="name" class="label">${ssrInterpolate(_ctx.$t("rules.form.name"))}</label><input id="name"${ssrRenderAttr("value", form.value.name)} type="text" required pattern="[a-zA-Z0-9_-]+" class="input" placeholder="my-awesome-rule"><p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${ssrInterpolate(_ctx.$t("rules.form.nameHint"))}</p></div><div><label for="description" class="label">${ssrInterpolate(_ctx.$t("rules.form.description"))}</label><textarea id="description" rows="3" class="input"${ssrRenderAttr("placeholder", _ctx.$t("rules.form.descriptionPlaceholder"))}>${ssrInterpolate(form.value.description)}</textarea></div><div><label for="visibility" class="label">${ssrInterpolate(_ctx.$t("rules.form.visibility"))}</label><select id="visibility" class="input"><option value="public"${ssrIncludeBooleanAttr(Array.isArray(form.value.visibility) ? ssrLooseContain(form.value.visibility, "public") : ssrLooseEqual(form.value.visibility, "public")) ? " selected" : ""}>${ssrInterpolate(_ctx.$t("rules.form.visibilityOptions.public"))}</option><option value="private"${ssrIncludeBooleanAttr(Array.isArray(form.value.visibility) ? ssrLooseContain(form.value.visibility, "private") : ssrLooseEqual(form.value.visibility, "private")) ? " selected" : ""}>${ssrInterpolate(_ctx.$t("rules.form.visibilityOptions.private"))}</option></select></div><div><label for="organization" class="label">${ssrInterpolate(_ctx.$t("rules.form.organization"))} (${ssrInterpolate(_ctx.$t("common.optional"))})</label><select id="organization" class="input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(selectedOrganizationId.value) ? ssrLooseContain(selectedOrganizationId.value, "") : ssrLooseEqual(selectedOrganizationId.value, "")) ? " selected" : ""}>${ssrInterpolate(_ctx.$t("rules.form.noOrganization"))}</option><!--[-->`);
      ssrRenderList(organizations.value, (organization) => {
        _push(`<option${ssrRenderAttr("value", organization.id)}${ssrIncludeBooleanAttr(Array.isArray(selectedOrganizationId.value) ? ssrLooseContain(selectedOrganizationId.value, organization.id) : ssrLooseEqual(selectedOrganizationId.value, organization.id)) ? " selected" : ""}>${ssrInterpolate(organization.displayName)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (form.value.org) {
        _push(`<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${ssrInterpolate(_ctx.$t("rules.form.urlPreview"))} @${ssrInterpolate(form.value.org)}/${ssrInterpolate(form.value.name || "rule-name")}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${ssrInterpolate(_ctx.$t("rules.form.organizationHint"))}</p></div><div><label for="tags" class="label">${ssrInterpolate(_ctx.$t("rules.form.tags"))}</label><div class="flex gap-2 mb-2"><input${ssrRenderAttr("value", tagInput.value)} type="text" class="input flex-1"${ssrRenderAttr("placeholder", _ctx.$t("rules.form.tagsPlaceholder"))}>`);
      _push(ssrRenderComponent(_component_Button, {
        type: "button",
        onClick: addTag,
        variant: "secondary",
        size: "sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("rules.form.addTag"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("rules.form.addTag")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex flex-wrap gap-2"><!--[-->`);
      ssrRenderList(form.value.tags, (tag, index) => {
        _push(`<span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${ssrInterpolate(tag)} <button type="button" class="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"> × </button></span>`);
      });
      _push(`<!--]--></div></div></div></div><div class="card"><h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">${ssrInterpolate(_ctx.$t("rules.ruleContent"))}</h2><div class="space-y-4"><div><label for="content" class="label">${ssrInterpolate(_ctx.$t("rules.form.content"))}</label><div class="mb-2">`);
      _push(ssrRenderComponent(_component_Button, {
        type: "button",
        onClick: ($event) => showFileUpload.value = !showFileUpload.value,
        variant: "ghost",
        size: "sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(showFileUpload.value ? _ctx.$t("rules.form.writeDirectly") : _ctx.$t("rules.form.uploadMarkdown"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(showFileUpload.value ? _ctx.$t("rules.form.writeDirectly") : _ctx.$t("rules.form.uploadMarkdown")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (showFileUpload.value) {
        _push(`<div class="mb-4"><input type="file" accept=".md,.markdown" class="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<textarea id="content" rows="15" required class="input font-mono text-sm"${ssrRenderAttr("placeholder", _ctx.$t("rules.form.contentPlaceholder"))}>${ssrInterpolate(form.value.content)}</textarea><p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${ssrInterpolate(_ctx.$t("rules.form.markdownSupported"))}</p></div></div></div><div class="flex justify-end gap-4">`);
      _push(ssrRenderComponent(_component_Button, {
        tag: _ctx.NuxtLink,
        to: "/rules",
        variant: "secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("common.cancel"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Button, {
        type: "submit",
        loading: loading.value,
        disabled: loading.value,
        variant: "primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(loading.value ? _ctx.$t("rules.creating") : _ctx.$t("rules.createRule"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(loading.value ? _ctx.$t("rules.creating") : _ctx.$t("rules.createRule")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (error.value) {
        _push(`<div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4"><p class="text-sm text-red-800 dark:text-red-400">${ssrInterpolate(error.value)}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</form></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/rules/new.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=new-BJ89lsD3.js.map
