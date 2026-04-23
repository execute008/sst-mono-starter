// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
  // SST deploys via Nitro's `aws-lambda` preset. SST wires this up for you
  // when using the `sst.aws.Nuxt` component — no manual config needed.
  nitro: {
    preset: "aws-lambda",
  },
  runtimeConfig: {
    public: {
      apiUrl: "",
      stage: "",
    },
  },
});
