import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { _ as __nuxt_component_2 } from "./Button-BAc5buFc.js";
import { _ as __nuxt_component_2$1 } from "./Card-gEDzb8hb.js";
import { _ as _sfc_main$3 } from "./Input-CQRSLkRN.js";
import { defineComponent, computed, useSSRContext, ref, inject, reactive, mergeProps, withCtx, createTextVNode, toDisplayString, createVNode, createBlock, openBlock, withDirectives, vModelCheckbox } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderComponent, ssrLooseContain } from "vue/server-renderer";
import { _ as __nuxt_component_5 } from "./Select-BXAA3UYM.js";
import { marked } from "marked";
import { storeToRefs } from "pinia";
import { u as useToast } from "./useToast-CcSWCLuS.js";
import { u as useAuthStore } from "./auth-DJ_gFT6B.js";
import { b as useRoute, c as useRouter, a as useNuxtApp, u as useI18n } from "../server.mjs";
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
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Textarea",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    label: {},
    placeholder: {},
    rows: { default: 4 },
    error: {},
    hint: {},
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    size: { default: "md" }
  },
  emits: ["update:modelValue", "blur", "focus"],
  setup(__props) {
    const props = __props;
    const id = `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const textareaClasses = computed(() => {
      const base = "w-full bg-white dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-600 dark:placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-y";
      const sizes = {
        sm: "text-sm px-3 py-1.5",
        md: "text-sm px-4 py-2",
        lg: "text-base px-4 py-3"
      };
      const states = {
        normal: "border-gray-200 dark:border-gray-800",
        error: "border-danger focus:border-danger focus:ring-danger",
        disabled: "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-950"
      };
      return [
        base,
        sizes[props.size],
        props.error ? states.error : states.normal,
        props.disabled && states.disabled
      ].filter(Boolean).join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (_ctx.label) {
        _push(`<label${ssrRenderAttr("for", id)} class="label">${ssrInterpolate(_ctx.label)} `);
        if (_ctx.required) {
          _push(`<span class="text-danger">*</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</label>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="relative"><textarea${ssrRenderAttr("id", id)}${ssrRenderAttr("placeholder", _ctx.placeholder)}${ssrRenderAttr("rows", _ctx.rows)}${ssrIncludeBooleanAttr(_ctx.disabled) ? " disabled" : ""}${ssrIncludeBooleanAttr(_ctx.required) ? " required" : ""} class="${ssrRenderClass(textareaClasses.value)}">${ssrInterpolate(_ctx.modelValue)}</textarea></div>`);
      if (_ctx.error) {
        _push(`<p class="error-message">${ssrInterpolate(_ctx.error)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (_ctx.hint && !_ctx.error) {
        _push(`<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${ssrInterpolate(_ctx.hint)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/Textarea.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TagInput",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    placeholder: { default: "タグを入力してEnterキーを押してください" },
    error: {},
    hint: {},
    disabled: { type: Boolean, default: false },
    maxTags: { default: 10 }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const inputValue = ref("");
    const inputClasses = computed(() => {
      const base = "w-full px-4 py-2 bg-white dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-600 dark:placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors";
      const states = {
        normal: "border-gray-200 dark:border-gray-800",
        error: "border-danger focus:border-danger focus:ring-danger",
        disabled: "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-950"
      };
      return [base, props.error ? states.error : states.normal, props.disabled && states.disabled].filter(Boolean).join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="space-y-2">`);
      if (_ctx.modelValue.length > 0) {
        _push(`<div class="flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(_ctx.modelValue, (tag, index) => {
          _push(`<span class="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full">${ssrInterpolate(tag)} <button type="button" class="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></span>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="relative"><input${ssrRenderAttr("value", inputValue.value)}${ssrRenderAttr("placeholder", _ctx.placeholder)}${ssrIncludeBooleanAttr(_ctx.disabled) ? " disabled" : ""} class="${ssrRenderClass(inputClasses.value)}"></div></div>`);
      if (_ctx.error) {
        _push(`<p class="error-message">${ssrInterpolate(_ctx.error)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (_ctx.hint && !_ctx.error) {
        _push(`<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${ssrInterpolate(_ctx.hint)}</p>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/common/TagInput.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "edit",
  __ssrInlineRender: true,
  setup(__props) {
    console.log("Edit page loaded - /rules/@[owner]/[name]/edit.vue");
    const route = useRoute();
    useRouter();
    const { $rpc } = useNuxtApp();
    const { t } = useI18n();
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore);
    const { success: toastSuccess, error: toastError } = useToast();
    const customParams = inject("customRouteParams", null);
    computed(() => {
      if (customParams) {
        return customParams;
      }
      return {
        owner: route.params.owner,
        name: route.params.name
      };
    });
    const loading = ref(false);
    const submitting = ref(false);
    const error = ref("");
    const rule = ref(null);
    const showPreview = ref(false);
    const form = reactive({
      name: "",
      description: "",
      content: "",
      visibility: "private",
      tags: [],
      changelog: "",
      isMajorVersionUp: false
    });
    const errors = reactive({
      name: "",
      description: "",
      content: "",
      visibility: "",
      tags: "",
      changelog: ""
    });
    const visibilityOptions = [
      { value: "public", label: t("rules.visibility.public") },
      { value: "private", label: t("rules.visibility.private") }
    ];
    const renderedContent = computed(() => {
      try {
        return marked(form.content || "");
      } catch (e) {
        return form.content || "";
      }
    });
    const hasChanges = computed(() => {
      if (!rule.value) {
        return false;
      }
      return form.name !== rule.value.name || form.description !== rule.value.description || form.content !== rule.value.content || form.visibility !== rule.value.visibility || JSON.stringify(form.tags) !== JSON.stringify(rule.value.tags);
    });
    const contentChanged = computed(() => {
      return rule.value && form.content !== rule.value.content;
    });
    const currentVersion = computed(() => {
      if (!rule.value) {
        return "1.0";
      }
      return `v${rule.value.version}`;
    });
    const nextVersion = computed(() => {
      if (!rule.value) {
        return "v1.0";
      }
      const versionParts = rule.value.version.split(".");
      const majorVersion = Number.parseInt(versionParts[0]) || 1;
      const minorVersion = Number.parseInt(versionParts[1]) || 0;
      if (form.isMajorVersionUp) {
        return `v${majorVersion + 1}.0`;
      } else {
        return `v${majorVersion}.${minorVersion + 1}`;
      }
    });
    const getRuleUrl = () => {
      if (!rule.value) {
        return "/rules";
      }
      if (rule.value.organization) {
        return `/rules/@${rule.value.organization.name}/${rule.value.name}`;
      }
      return `/rules/@${rule.value.author.username}/${rule.value.name}`;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_CommonButton = __nuxt_component_2;
      const _component_CommonCard = __nuxt_component_2$1;
      const _component_CommonInput = _sfc_main$3;
      const _component_CommonTextarea = _sfc_main$2;
      const _component_CommonSelect = __nuxt_component_5;
      const _component_CommonTagInput = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 dark:bg-gray-950" }, _attrs))}><div class="container-lg py-8">`);
      if (loading.value) {
        _push(`<div class="max-w-4xl mx-auto"><div class="skeleton h-10 w-2/3 mb-4"></div><div class="skeleton h-6 w-1/3 mb-8"></div><div class="card"><div class="skeleton h-4 w-full mb-2"></div><div class="skeleton h-4 w-3/4 mb-2"></div><div class="skeleton h-4 w-1/2"></div></div></div>`);
      } else if (error.value) {
        _push(`<div class="text-center py-12"><p class="text-danger mb-4">${ssrInterpolate(error.value)}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: getRuleUrl()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, { variant: "ghost" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(_ctx.$t("common.back"))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(_ctx.$t("common.back")), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_CommonButton, { variant: "ghost" }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(_ctx.$t("common.back")), 1)
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (rule.value) {
        _push(`<div class="max-w-4xl mx-auto"><div class="flex items-center justify-between mb-8"><h1 class="heading-1">${ssrInterpolate(_ctx.$t("rules.edit.title"))}</h1>`);
        if (hasChanges.value) {
          _push(`<span class="text-sm text-warning-600 dark:text-warning-400"><i class="fa-solid fa-circle-exclamation mr-1"></i> ${ssrInterpolate(_ctx.$t("rules.edit.unsavedChanges"))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><form>`);
        _push(ssrRenderComponent(_component_CommonCard, { class: "mb-6" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"${_scopeId}>${ssrInterpolate(_ctx.$t("rules.form.basicInfo"))}</h2><div class="space-y-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_CommonInput, {
                modelValue: form.name,
                "onUpdate:modelValue": ($event) => form.name = $event,
                label: _ctx.$t("rules.form.name"),
                placeholder: _ctx.$t("rules.form.namePlaceholder"),
                required: "",
                disabled: "",
                error: errors.name
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_CommonTextarea, {
                modelValue: form.description,
                "onUpdate:modelValue": ($event) => form.description = $event,
                label: _ctx.$t("rules.form.description"),
                placeholder: _ctx.$t("rules.form.descriptionPlaceholder"),
                rows: "3",
                error: errors.description
              }, null, _parent2, _scopeId));
              _push2(`<div${_scopeId}><label class="label"${_scopeId}>${ssrInterpolate(_ctx.$t("rules.form.visibility"))}</label>`);
              _push2(ssrRenderComponent(_component_CommonSelect, {
                modelValue: form.visibility,
                "onUpdate:modelValue": ($event) => form.visibility = $event,
                options: visibilityOptions,
                error: errors.visibility
              }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><label class="label"${_scopeId}>${ssrInterpolate(_ctx.$t("rules.form.tags"))}</label>`);
              _push2(ssrRenderComponent(_component_CommonTagInput, {
                modelValue: form.tags,
                "onUpdate:modelValue": ($event) => form.tags = $event,
                placeholder: _ctx.$t("rules.form.tagsPlaceholder"),
                error: errors.tags
              }, null, _parent2, _scopeId));
              _push2(`</div></div>`);
            } else {
              return [
                createVNode("h2", { class: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4" }, toDisplayString(_ctx.$t("rules.form.basicInfo")), 1),
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(_component_CommonInput, {
                    modelValue: form.name,
                    "onUpdate:modelValue": ($event) => form.name = $event,
                    label: _ctx.$t("rules.form.name"),
                    placeholder: _ctx.$t("rules.form.namePlaceholder"),
                    required: "",
                    disabled: "",
                    error: errors.name
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "placeholder", "error"]),
                  createVNode(_component_CommonTextarea, {
                    modelValue: form.description,
                    "onUpdate:modelValue": ($event) => form.description = $event,
                    label: _ctx.$t("rules.form.description"),
                    placeholder: _ctx.$t("rules.form.descriptionPlaceholder"),
                    rows: "3",
                    error: errors.description
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "label", "placeholder", "error"]),
                  createVNode("div", null, [
                    createVNode("label", { class: "label" }, toDisplayString(_ctx.$t("rules.form.visibility")), 1),
                    createVNode(_component_CommonSelect, {
                      modelValue: form.visibility,
                      "onUpdate:modelValue": ($event) => form.visibility = $event,
                      options: visibilityOptions,
                      error: errors.visibility
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "error"])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "label" }, toDisplayString(_ctx.$t("rules.form.tags")), 1),
                    createVNode(_component_CommonTagInput, {
                      modelValue: form.tags,
                      "onUpdate:modelValue": ($event) => form.tags = $event,
                      placeholder: _ctx.$t("rules.form.tagsPlaceholder"),
                      error: errors.tags
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder", "error"])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_CommonCard, { class: "mb-6" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between mb-4"${_scopeId}><h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100"${_scopeId}>${ssrInterpolate(_ctx.$t("rules.form.content"))}</h2><button type="button" class="text-sm text-primary-600 dark:text-primary-400 hover:underline"${_scopeId}>${ssrInterpolate(showPreview.value ? _ctx.$t("rules.edit.hidePreview") : _ctx.$t("rules.edit.showPreview"))}</button></div>`);
              if (!showPreview.value) {
                _push2(`<div${_scopeId}>`);
                _push2(ssrRenderComponent(_component_CommonTextarea, {
                  modelValue: form.content,
                  "onUpdate:modelValue": ($event) => form.content = $event,
                  placeholder: _ctx.$t("rules.form.contentPlaceholder"),
                  rows: "15",
                  class: "font-mono",
                  required: "",
                  error: errors.content
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
              } else {
                _push2(`<div class="prose prose-sm dark:prose-invert max-w-none"${_scopeId}><div${_scopeId}>${renderedContent.value ?? ""}</div></div>`);
              }
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between mb-4" }, [
                  createVNode("h2", { class: "text-lg font-semibold text-gray-900 dark:text-gray-100" }, toDisplayString(_ctx.$t("rules.form.content")), 1),
                  createVNode("button", {
                    type: "button",
                    onClick: ($event) => showPreview.value = !showPreview.value,
                    class: "text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  }, toDisplayString(showPreview.value ? _ctx.$t("rules.edit.hidePreview") : _ctx.$t("rules.edit.showPreview")), 9, ["onClick"])
                ]),
                !showPreview.value ? (openBlock(), createBlock("div", { key: 0 }, [
                  createVNode(_component_CommonTextarea, {
                    modelValue: form.content,
                    "onUpdate:modelValue": ($event) => form.content = $event,
                    placeholder: _ctx.$t("rules.form.contentPlaceholder"),
                    rows: "15",
                    class: "font-mono",
                    required: "",
                    error: errors.content
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder", "error"])
                ])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "prose prose-sm dark:prose-invert max-w-none"
                }, [
                  createVNode("div", { innerHTML: renderedContent.value }, null, 8, ["innerHTML"])
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        if (contentChanged.value) {
          _push(ssrRenderComponent(_component_CommonCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"${_scopeId}>${ssrInterpolate(_ctx.$t("rules.edit.changeLog"))}</h2>`);
                _push2(ssrRenderComponent(_component_CommonTextarea, {
                  modelValue: form.changelog,
                  "onUpdate:modelValue": ($event) => form.changelog = $event,
                  placeholder: _ctx.$t("rules.edit.changeLogPlaceholder"),
                  rows: "3",
                  required: "",
                  error: errors.changelog
                }, null, _parent2, _scopeId));
                _push2(`<div class="mt-4"${_scopeId}><label class="flex items-center gap-2"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(form.isMajorVersionUp) ? ssrLooseContain(form.isMajorVersionUp, null) : form.isMajorVersionUp) ? " checked" : ""} type="checkbox" class="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"${_scopeId}><span class="text-sm text-gray-700 dark:text-gray-300"${_scopeId}>${ssrInterpolate(_ctx.$t("rules.edit.incrementMajorVersion"))} (${ssrInterpolate(currentVersion.value)} → ${ssrInterpolate(nextVersion.value)}) </span></label></div>`);
              } else {
                return [
                  createVNode("h2", { class: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4" }, toDisplayString(_ctx.$t("rules.edit.changeLog")), 1),
                  createVNode(_component_CommonTextarea, {
                    modelValue: form.changelog,
                    "onUpdate:modelValue": ($event) => form.changelog = $event,
                    placeholder: _ctx.$t("rules.edit.changeLogPlaceholder"),
                    rows: "3",
                    required: "",
                    error: errors.changelog
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder", "error"]),
                  createVNode("div", { class: "mt-4" }, [
                    createVNode("label", { class: "flex items-center gap-2" }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => form.isMajorVersionUp = $event,
                        type: "checkbox",
                        class: "h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelCheckbox, form.isMajorVersionUp]
                      ]),
                      createVNode("span", { class: "text-sm text-gray-700 dark:text-gray-300" }, toDisplayString(_ctx.$t("rules.edit.incrementMajorVersion")) + " (" + toDisplayString(currentVersion.value) + " → " + toDisplayString(nextVersion.value) + ") ", 1)
                    ])
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-end gap-3 mt-8">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: getRuleUrl()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_CommonButton, {
                type: "button",
                variant: "ghost"
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
            } else {
              return [
                createVNode(_component_CommonButton, {
                  type: "button",
                  variant: "ghost"
                }, {
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
          loading: submitting.value,
          disabled: !hasChanges.value
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(_ctx.$t("rules.edit.update"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(_ctx.$t("rules.edit.update")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></form></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/rules/@[owner]/[name]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=edit-KVHlj-D7.js.map
