import { _ as __nuxt_component_0 } from "./nuxt-link-4uLnvjVp.js";
import { _ as __nuxt_component_2 } from "./Button-BAc5buFc.js";
import { _ as __nuxt_component_2$1 } from "./Card-gEDzb8hb.js";
import { unref, withCtx, createVNode, createBlock, toDisplayString, openBlock, createTextVNode, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { u as useI18n } from "../server.mjs";
import { u as useHead } from "./v3-CdJoEeaK.js";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
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
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { t } = useI18n();
    const NuxtLink = __nuxt_component_0;
    useHead({
      title: `zxcv - ${t("footer.tagline")}`
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CommonButton = __nuxt_component_2;
      const _component_CommonCard = __nuxt_component_2$1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-primary-950 dark:via-primary-900 dark:to-primary-950"><div class="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div><div class="absolute inset-0 overflow-hidden"><div class="absolute top-20 left-10 w-20 h-20 bg-primary-400/10 rounded-full blur-xl animate-pulse float-animation"></div><div class="absolute bottom-20 right-10 w-32 h-32 bg-accent-500/10 rounded-full blur-xl animate-pulse delay-700 float-animation"></div><div class="absolute top-40 right-20 w-16 h-16 bg-primary-600/10 rounded-full blur-lg animate-pulse delay-1000 float-animation"></div><div class="absolute bottom-40 left-20 w-24 h-24 bg-accent-400/10 rounded-full blur-xl animate-pulse delay-500 float-animation"></div></div><div class="relative container-lg py-24 sm:py-32 lg:py-40"><div class="text-center"><div class="mb-8 flex justify-center stagger-item stagger-1"><div class="relative rounded-full px-4 py-2 text-sm font-medium leading-6 text-gray-600 dark:text-gray-400 ring-1 ring-primary-200 dark:ring-primary-800 hover:ring-primary-300 dark:hover:ring-primary-700 transition-all duration-300 hover:scale-105 cursor-pointer glass">${ssrInterpolate(_ctx.$t("home.hero.badge"))} <span class="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-500/20 to-accent-500/20 blur-lg"></span></div></div><h1 class="text-5xl font-black tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl xl:text-8xl stagger-item stagger-2"><span class="block mb-2">${ssrInterpolate(_ctx.$t("home.hero.title"))}</span><span class="block bg-gradient-to-r from-primary-600 via-accent-500 to-accent-600 bg-clip-text text-transparent">${ssrInterpolate(_ctx.$t("home.hero.titleHighlight"))}</span></h1><p class="mt-8 max-w-3xl mx-auto text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed stagger-item stagger-3">${ssrInterpolate(_ctx.$t("home.hero.description"))}</p><div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 stagger-item stagger-4">`);
      _push(ssrRenderComponent(_component_CommonButton, {
        tag: unref(NuxtLink),
        to: "/rules",
        variant: "gradient",
        size: "lg"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>${ssrInterpolate(_ctx.$t("home.hero.viewRules"))}</span><svg class="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"${_scopeId}></path></svg>`);
          } else {
            return [
              createVNode("span", null, toDisplayString(_ctx.$t("home.hero.viewRules")), 1),
              (openBlock(), createBlock("svg", {
                class: "ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M13 7l5 5m0 0l-5 5m5-5H6"
                })
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_CommonButton, {
        tag: unref(NuxtLink),
        to: "/register",
        variant: "outline",
        size: "lg",
        class: "hover-lift shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("home.hero.getStarted"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("home.hero.getStarted")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div><div class="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-950/50"><div class="container-lg"><div class="text-center stagger-item stagger-1"><h2 class="text-base font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">${ssrInterpolate(_ctx.$t("home.features.title"))}</h2><h3 class="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">${ssrInterpolate(_ctx.$t("home.features.subtitle"))}</h3><p class="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">${ssrInterpolate(_ctx.$t("home.features.description"))}</p></div><div class="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">`);
      _push(ssrRenderComponent(_component_CommonCard, {
        variant: "bordered",
        hover: "",
        class: "group stagger-item stagger-2 overflow-hidden relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"${_scopeId}></div><div class="relative"${_scopeId}><div class="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"${_scopeId}><svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"${_scopeId}></path></svg></div><h3 class="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.versionControl.title"))}</h3><p class="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.versionControl.description"))}</p></div>`);
          } else {
            return [
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" }),
              createVNode("div", { class: "relative" }, [
                createVNode("div", { class: "mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" }, [
                  (openBlock(), createBlock("svg", {
                    class: "h-7 w-7",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    })
                  ]))
                ]),
                createVNode("h3", { class: "text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200" }, toDisplayString(_ctx.$t("home.features.versionControl.title")), 1),
                createVNode("p", { class: "mt-3 text-gray-600 dark:text-gray-400 leading-relaxed" }, toDisplayString(_ctx.$t("home.features.versionControl.description")), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_CommonCard, {
        variant: "bordered",
        hover: "",
        class: "group stagger-item stagger-3 overflow-hidden relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"${_scopeId}></div><div class="relative"${_scopeId}><div class="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-accent-500/10 to-accent-600/10 text-accent-600 dark:text-accent-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"${_scopeId}><svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"${_scopeId}></path></svg></div><h3 class="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors duration-200"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.organizationCollaboration.title"))}</h3><p class="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.organizationCollaboration.description"))}</p></div>`);
          } else {
            return [
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" }),
              createVNode("div", { class: "relative" }, [
                createVNode("div", { class: "mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-accent-500/10 to-accent-600/10 text-accent-600 dark:text-accent-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" }, [
                  (openBlock(), createBlock("svg", {
                    class: "h-7 w-7",
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
                  ]))
                ]),
                createVNode("h3", { class: "text-xl font-semibold text-gray-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors duration-200" }, toDisplayString(_ctx.$t("home.features.organizationCollaboration.title")), 1),
                createVNode("p", { class: "mt-3 text-gray-600 dark:text-gray-400 leading-relaxed" }, toDisplayString(_ctx.$t("home.features.organizationCollaboration.description")), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_CommonCard, {
        variant: "bordered",
        hover: "",
        class: "group stagger-item stagger-4 overflow-hidden relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"${_scopeId}></div><div class="relative"${_scopeId}><div class="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-success/10 to-success-dark/10 text-success dark:text-success-light group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"${_scopeId}><svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"${_scopeId}></path></svg></div><h3 class="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-success dark:group-hover:text-success-light transition-colors duration-200"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.export.title"))}</h3><p class="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.export.description"))}</p></div>`);
          } else {
            return [
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" }),
              createVNode("div", { class: "relative" }, [
                createVNode("div", { class: "mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-success/10 to-success-dark/10 text-success dark:text-success-light group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" }, [
                  (openBlock(), createBlock("svg", {
                    class: "h-7 w-7",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    })
                  ]))
                ]),
                createVNode("h3", { class: "text-xl font-semibold text-gray-900 dark:text-white group-hover:text-success dark:group-hover:text-success-light transition-colors duration-200" }, toDisplayString(_ctx.$t("home.features.export.title")), 1),
                createVNode("p", { class: "mt-3 text-gray-600 dark:text-gray-400 leading-relaxed" }, toDisplayString(_ctx.$t("home.features.export.description")), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_CommonCard, {
        variant: "bordered",
        hover: "",
        class: "group stagger-item stagger-5 overflow-hidden relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"${_scopeId}></div><div class="relative"${_scopeId}><div class="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"${_scopeId}><svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"${_scopeId}></path></svg></div><h3 class="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.search.title"))}</h3><p class="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.search.description"))}</p></div>`);
          } else {
            return [
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" }),
              createVNode("div", { class: "relative" }, [
                createVNode("div", { class: "mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 text-primary-600 dark:text-primary-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" }, [
                  (openBlock(), createBlock("svg", {
                    class: "h-7 w-7",
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
                createVNode("h3", { class: "text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200" }, toDisplayString(_ctx.$t("home.features.search.title")), 1),
                createVNode("p", { class: "mt-3 text-gray-600 dark:text-gray-400 leading-relaxed" }, toDisplayString(_ctx.$t("home.features.search.description")), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_CommonCard, {
        variant: "bordered",
        hover: "",
        class: "group stagger-item stagger-6 overflow-hidden relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"${_scopeId}></div><div class="relative"${_scopeId}><div class="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-warning/10 to-warning-dark/10 text-warning dark:text-warning-light group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"${_scopeId}><svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"${_scopeId}></path></svg></div><h3 class="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-warning dark:group-hover:text-warning-light transition-colors duration-200"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.accessControl.title"))}</h3><p class="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.accessControl.description"))}</p></div>`);
          } else {
            return [
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" }),
              createVNode("div", { class: "relative" }, [
                createVNode("div", { class: "mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-warning/10 to-warning-dark/10 text-warning dark:text-warning-light group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" }, [
                  (openBlock(), createBlock("svg", {
                    class: "h-7 w-7",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    })
                  ]))
                ]),
                createVNode("h3", { class: "text-xl font-semibold text-gray-900 dark:text-white group-hover:text-warning dark:group-hover:text-warning-light transition-colors duration-200" }, toDisplayString(_ctx.$t("home.features.accessControl.title")), 1),
                createVNode("p", { class: "mt-3 text-gray-600 dark:text-gray-400 leading-relaxed" }, toDisplayString(_ctx.$t("home.features.accessControl.description")), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_CommonCard, {
        variant: "bordered",
        hover: "",
        class: "group stagger-item stagger-7 overflow-hidden relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"${_scopeId}></div><div class="relative"${_scopeId}><div class="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-info/10 to-info-dark/10 text-info dark:text-info-light group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"${_scopeId}><svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"${_scopeId}></path></svg></div><h3 class="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-info dark:group-hover:text-info-light transition-colors duration-200"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.api.title"))}</h3><p class="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed"${_scopeId}>${ssrInterpolate(_ctx.$t("home.features.api.description"))}</p></div>`);
          } else {
            return [
              createVNode("div", { class: "absolute inset-0 bg-gradient-to-br from-info/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" }),
              createVNode("div", { class: "relative" }, [
                createVNode("div", { class: "mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-info/10 to-info-dark/10 text-info dark:text-info-light group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" }, [
                  (openBlock(), createBlock("svg", {
                    class: "h-7 w-7",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    })
                  ]))
                ]),
                createVNode("h3", { class: "text-xl font-semibold text-gray-900 dark:text-white group-hover:text-info dark:group-hover:text-info-light transition-colors duration-200" }, toDisplayString(_ctx.$t("home.features.api.title")), 1),
                createVNode("p", { class: "mt-3 text-gray-600 dark:text-gray-400 leading-relaxed" }, toDisplayString(_ctx.$t("home.features.api.description")), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div><div class="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 animated-gradient"><div class="absolute inset-0"><div class="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]"></div></div><div class="absolute inset-0 overflow-hidden"><div class="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse float-animation"></div><div class="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-700 float-animation"></div><div class="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse delay-1000 float-animation"></div></div><div class="relative container-lg py-20 sm:py-24 lg:py-32"><div class="text-center animate-in slide-up-enter-active"><h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">${ssrInterpolate(_ctx.$t("home.cta.title"))}</h2><p class="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-primary-100 leading-relaxed">${ssrInterpolate(_ctx.$t("home.cta.description"))}</p><div class="mt-12">`);
      _push(ssrRenderComponent(_component_CommonButton, {
        tag: unref(NuxtLink),
        to: "/register",
        variant: "secondary",
        size: "xl",
        class: "bg-white text-primary-600 hover:bg-gray-100 hover:scale-105 hover-lift shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold px-12 py-4"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("home.cta.button"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("home.cta.button")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-BO1aIDl8.js.map
