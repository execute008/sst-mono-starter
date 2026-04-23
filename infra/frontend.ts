import { router } from "./api";
import { publicAssetsBucket } from "./storage";

// Nuxt 3 web app. `sst.aws.Nuxt` wraps Nitro AWS deployment
// (Lambda + CloudFront). Point API calls at the shared router so /v2
// requests flow through the same domain in production.
export const web = new sst.aws.Nuxt("Web", {
  path: "apps/web",
  link: [publicAssetsBucket],
  environment: {
    NUXT_PUBLIC_API_URL: router.url,
    NUXT_PUBLIC_STAGE: $app.stage,
  },
});
