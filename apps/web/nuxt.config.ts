// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  // Devtools off in production. Avoids exposing internals on real deploys
  // even if NODE_ENV happens to leak through.
  devtools: { enabled: process.env.NODE_ENV !== "production" },
  // SST deploys via Nitro's `aws-lambda` preset. SST wires this up for you
  // when using the `sst.aws.Nuxt` component — no manual config needed.
  nitro: {
    preset: "aws-lambda",
  },
  runtimeConfig: {
    public: {
      apiUrl: "",
      assetsBaseUrl: "",
      // stage: "" — intentionally dropped; infra stopped exporting NUXT_PUBLIC_STAGE.
    },
  },
  // Conservative-but-permissive baseline security headers. The CSP allows
  // `connect-src https:` because the API URL varies per stage; once we have
  // a stable per-stage origin we should narrow this to the exact host.
  routeRules: {
    "/**": {
      headers: {
        "Strict-Transport-Security":
          "max-age=63072000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Frame-Options": "DENY",
        "Content-Security-Policy":
          "default-src 'self'; connect-src 'self' https:; img-src 'self' data: https:; frame-ancestors 'none'",
      },
    },
  },
});
