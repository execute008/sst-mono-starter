// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "starter",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1",
        },
      },
    };
  },
  async run() {
    const storage = await import("./infra/storage");
    const db = await import("./infra/database");
    const authStack = await import("./infra/auth");
    const api = await import("./infra/api");
    const frontend = await import("./infra/frontend");

    return {
      AppStage: $app.stage,
      Region: $app.providers?.aws.region,
      Table: db.table.name,
      PublicAssetsBucket: storage.publicAssetsBucket.name,
      AuthUrl: authStack.auth.url,
      ApiUrl: api.api.url,
      WebUrl: frontend.web.url,
    };
  },
  console: {
    autodeploy: {
      target(event) {
        if (event.type === "branch" && event.action === "pushed") {
          if (event.branch === "production") return { stage: "production" };
          if (event.branch === "stage") return { stage: "stage" };
          if (event.branch === "dev") return { stage: "dev" };
        }
      },
      async workflow({ $, event }) {
        await $`bun install`;
        if (event.action === "removed") {
          await $`bun sst remove`;
        } else {
          await $`bun sst deploy`;
        }
      },
    },
  },
});
