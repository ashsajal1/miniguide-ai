import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

// Clerk's ESM build calls require() in places Next's bundler used to resolve:
// require("server-only") markers in auth()/currentUser() and
// require("next/navigation") in its routing hooks. workerd/browsers have no
// require, and vinext does not rewrite requires in dependency ESM, so fix both.
function clerkRequireShim(): Plugin {
  const markers = /require\(\s*["'](?:server-only|client-only)["']\s*\)\s*;?/g;
  const navigation = /require\(\s*["']next\/navigation["']\s*\)/g;
  return {
    name: "clerk-edgesafe-require",
    enforce: "pre",
    transform(code, id) {
      if (!/[\\/]@clerk[\\/]/.test(id)) return;
      let out = code.replace(markers, "");
      if (navigation.test(out)) {
        navigation.lastIndex = 0;
        out = `import * as __vinext_next_navigation from "next/navigation";\n${out.replace(navigation, "__vinext_next_navigation")}`;
      }
      return out === code ? undefined : { code: out, map: null };
    },
  };
}

export default defineConfig({
  plugins: [
    clerkRequireShim(),
    vinext({
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
  environments: {
    // Clerk's provider and SignedOut/useAuth must share one context instance in
    // the browser; pre-bundling @clerk/nextjs splits it from @clerk/clerk-react.
    client: {
      optimizeDeps: {
        exclude: ["@clerk/nextjs", "@clerk/clerk-react", "@clerk/shared"],
      },
    },
  },
});
