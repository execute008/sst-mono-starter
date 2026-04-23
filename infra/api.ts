import { auth } from "./auth";
import { table, rateLimitTable } from "./database";
import { publicAssetsBucket, privateAssetsBucket } from "./storage";
import { EXAMPLE_API_KEY } from "./secrets";

// Router fronts the API so you can later mount /v1, /v2, streaming handlers
// on the same domain without introducing a new CloudFront distribution.
export const router = new sst.aws.Router("ApiRouter");

// Go / Fiber lambda behind the router at /v2.
// Mirror of fr3n-mono's `apps/api-v2` pattern: SST builds the Go handler
// from `apps/api/main.go`, fiberadapter bridges API Gateway v2 → Fiber.
export const api = new sst.aws.Function("Api", {
  runtime: "go",
  handler: "apps/api",
  url: {
    cors: false,
    router: {
      instance: router,
      path: "/v2",
    },
  },
  link: [
    auth,
    table,
    rateLimitTable,
    publicAssetsBucket,
    privateAssetsBucket,
    EXAMPLE_API_KEY,
  ],
  environment: {
    STAGE: $app.stage,
    AUTH_URL: auth.url,
    ELECTRO_TABLE_NAME: table.name,
    RATE_LIMIT_TABLE_NAME: rateLimitTable.name,
    PUBLIC_ASSETS_BUCKET: publicAssetsBucket.name,
    PRIVATE_ASSETS_BUCKET: privateAssetsBucket.name,
  },
  timeout: "30 seconds",
  memory: "512 MB",
});
