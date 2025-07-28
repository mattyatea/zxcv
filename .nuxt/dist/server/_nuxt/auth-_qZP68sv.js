import { _ as _sfc_main$1 } from "./Header-CeSEviV5.js";
import { computed, mergeProps, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderSlotInner } from "vue/server-renderer";
import { useRoute } from "vue-router";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "./nuxt-link-4uLnvjVp.js";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
import "../server.mjs";
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
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "@orpc/client";
import "@orpc/client/fetch";
import "./Button-BAc5buFc.js";
import "./Modal-DWgkDmQ5.js";
import "./Input-CQRSLkRN.js";
import "./auth-DJ_gFT6B.js";
const _sfc_main = {
  __name: "auth",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const isLoginTab = computed(() => {
      return route.path === "/login" || route.path === "/auth" && route.query.tab !== "register";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LayoutHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col relative overflow-hidden auth-layout" }, _attrs))} data-v-a0ea0645><template>`);
      _push(ssrRenderComponent(_component_LayoutHeader, null, null, _parent));
      _push(`</template><div class="flex-1 flex relative" data-v-a0ea0645><div class="absolute inset-0 z-0" data-v-a0ea0645><div class="${ssrRenderClass([{
        "grid-slide-left bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600": isLoginTab.value,
        "grid-slide-right bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600": !isLoginTab.value
      }, "absolute inset-0 grid-slide-bg"])}" data-v-a0ea0645><div class="absolute inset-0 opacity-30" data-v-a0ea0645><div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent animate-pulse-slow" data-v-a0ea0645></div><div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse-slow animation-delay-2s" data-v-a0ea0645></div></div><div class="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] grid-pattern" data-v-a0ea0645></div><div class="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl floating-orb orb-1" data-v-a0ea0645></div><div class="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl floating-orb orb-2" data-v-a0ea0645></div><div class="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl floating-orb orb-3" data-v-a0ea0645></div><div class="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl floating-orb orb-4" data-v-a0ea0645></div><div class="particles-container" data-v-a0ea0645><div class="particle particle-1" data-v-a0ea0645></div><div class="particle particle-2" data-v-a0ea0645></div><div class="particle particle-3" data-v-a0ea0645></div><div class="particle particle-4" data-v-a0ea0645></div><div class="particle particle-5" data-v-a0ea0645></div></div></div><div class="absolute inset-0 backdrop-blur-[2px] bg-black/5" data-v-a0ea0645></div></div><div class="relative z-10 w-full" data-v-a0ea0645><template>`);
      ssrRenderSlotInner(_ctx.$slots, "default", {}, null, _push, _parent, null, true);
      _push(`</template></div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/auth.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const auth = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a0ea0645"]]);
export {
  auth as default
};
//# sourceMappingURL=auth-_qZP68sv.js.map
