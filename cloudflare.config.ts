import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "miniguide-ai",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-20",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      // Images
      IMAGES: bindings.images(),
      // Database
      DATABASE_URL: bindings.secret(),
      // AI
      AI_PROVIDER_NAME: bindings.secret(),
      AI_BASE_URL: bindings.secret(),
      AI_API_KEY: bindings.secret(),
      GROQ_API_KEY: bindings.secret(),
      AI_MODEL: bindings.secret(),
      AI_URL_MODEL: bindings.secret(),
      // Clerk
      CLERK_SECRET_KEY: bindings.secret(),
      CLERK_WEBHOOK_SECRET: bindings.secret(),
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: bindings.text("pk_test_bmF0aW9uYWwtY2F0dGxlLTU0LmNsZXJrLmFjY291bnRzLmRldiQ"),
    },
  }),
});
