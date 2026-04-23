import { issuer } from "@openauthjs/openauth";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { DynamoStorage } from "@openauthjs/openauth/storage/dynamo";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";

import { subjects } from "./subjects.js";

// OpenAuth issuer — stateless Lambda backed by a dedicated Dynamo table.
// Starter uses the `code` provider (email/tel one-time code). Add `password`,
// `google`, etc. by appending to `providers`.
const storage = DynamoStorage({
  table: Resource.AuthTable.name,
  pk: "pk",
  sk: "sk",
});

const app = issuer({
  subjects,
  storage,
  ttl: {
    access: 60 * 60 * 4,          // 4h
    refresh: 60 * 60 * 24 * 7,    // 7d
  },
  providers: {
    code: CodeProvider(
      CodeUI({
        sendCode: async (claims, code) => {
          // TODO: send `code` via email/SMS. For local dev we just log it.
          console.log("OpenAuth code:", { claims, code });
        },
      }),
    ),
  },
  success: async (ctx, value) => {
    // `value.claims.email` (or `tel`) is what the user submitted.
    const contact = value.claims.email
      ? { email: value.claims.email }
      : value.claims.tel
        ? { tel: value.claims.tel }
        : undefined;

    return ctx.subject("user", {
      id: value.claims.email ?? value.claims.tel ?? "anonymous",
      provider: "code",
      contact,
    });
  },
});

export const handler = handle(app);
