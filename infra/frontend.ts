import { router } from "./api";
import { publicAssetsBucket } from "./storage";

// Nuxt 3 web app. `sst.aws.Nuxt` wraps Nitro AWS deployment
// (Lambda + CloudFront). Point API calls at the shared router so /v2
// requests flow through the same domain in production.
//
// Hardening:
//  - C2: dropped `link: [publicAssetsBucket]`. The frontend doesn't need IAM
//    access to the bucket — it only needs the public URL to render assets,
//    which we now serve via the Router (`/cdn/*`, see infra/api.ts). If the
//    Nuxt SSR layer ever needs to read objects directly, add a scoped
//    permission via `permissions: [...]` rather than re-linking the bucket.
//  - M-Inf4: removed NUXT_PUBLIC_STAGE — anything `NUXT_PUBLIC_*` is shipped
//    to the browser. STAGE is server-side only; expose via a server runtime
//    config in the Nuxt app if you need it there.
//
// NOTE(apps/web): asset URLs should be constructed as
// `${NUXT_PUBLIC_API_URL}/cdn/<key>` (the bucket is no longer publicly
// addressable directly). The bucket's domain name is exposed as
// NUXT_PUBLIC_ASSETS_BUCKET_DOMAIN for tooling/debug only — do NOT use it
// for browser-facing asset URLs in production.
export const web = new sst.aws.Nuxt("Web", {
  path: "apps/web",
  environment: {
    NUXT_PUBLIC_API_URL: router.url,
    // Browsers fetch assets through the Router/CDN under /cdn/*.
    NUXT_PUBLIC_ASSETS_BASE_URL: $interpolate`${router.url}/cdn`,
    // Raw bucket DNS (s3.amazonaws.com) — kept as a non-public env var for
    // server-side use only. Do NOT prefix this with NUXT_PUBLIC_.
    PUBLIC_ASSETS_BUCKET_DOMAIN: publicAssetsBucket.domain,
  },
});
