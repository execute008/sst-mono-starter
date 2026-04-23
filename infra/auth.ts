// Dedicated table for OpenAuth storage (sessions, codes, refresh tokens).
// Kept separate from the application Dynamo table to keep access patterns
// simple and to make blast-radius smaller if you ever want to reset it.
export const authTable = new sst.aws.Dynamo("AuthTable", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  ttl: "ttl",
});

// OpenAuth issuer Lambda. `sst.aws.Auth` sets up a Function + Router +
// CloudFront distribution and exposes `.url` for the issuer.
export const auth = new sst.aws.Auth("Auth", {
  issuer: {
    handler: "apps/auth/src/index.handler",
    link: [authTable],
    environment: {
      STAGE: $app.stage,
    },
  },
});
