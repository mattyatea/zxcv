import { ref, mergeProps, unref, useSSRContext } from "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/vue@3.5.17_typescript@5.8.3/node_modules/vue/index.mjs";
import { ssrRenderAttrs, ssrInterpolate } from "vue/server-renderer";
import { a as useNuxtApp } from "../server.mjs";
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
import "pinia";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "/Users/sou_kohata/WebstormProjects/zxcv/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "@orpc/client";
import "@orpc/client/fetch";
const _sfc_main = {
  __name: "testOrpc",
  __ssrInlineRender: true,
  setup(__props) {
    const { $rpc } = useNuxtApp();
    const result = ref(null);
    const error = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-8" }, _attrs))}><h1 class="text-2xl font-bold mb-4">${ssrInterpolate(_ctx.$t("test.orpc.title"))}</h1><div class="space-y-4"><button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">${ssrInterpolate(_ctx.$t("test.orpc.healthCheck"))}</button><button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">${ssrInterpolate(_ctx.$t("test.orpc.ruleCreate"))}</button>`);
      if (unref(result)) {
        _push(`<div class="mt-4 p-4 bg-gray-100 rounded"><pre>${ssrInterpolate(JSON.stringify(unref(result), null, 2))}</pre></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<div class="mt-4 p-4 bg-red-100 text-red-700 rounded"><pre>${ssrInterpolate(JSON.stringify(unref(error), null, 2))}</pre></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/testOrpc.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=testOrpc-D1V5A7VZ.js.map
