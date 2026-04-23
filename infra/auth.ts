import { AUTH_DOMAIN, HAS_CUSTOM_DOMAIN } from "./env";

// Dedicated table for OpenAuth storage (sessions, codes, refresh tokens).
// Kept separate from the application Dynamo table to keep access patterns
// simple and to make blast-radius smaller if you ever want to reset it.
//
// Hardening (H-I1):
//  - PITR is on by default in `sst.aws.Dynamo`.
//  - Deletion protection enabled on protected stages.
//
// TODO(L-Auth3): Consider encrypting this table with a customer-managed KMS
// key (CMK) so credential rotation and key access are auditable separately
// from the AWS-owned default key. Wire it via `transform.table` here:
//   transform: { table: (args) => { args.serverSideEncryption = {
//     enabled: true, kmsKeyArn: myCmk.arn }; } }
// Skipped now — adds a KMS resource + IAM scope and recurring cost.
const isProtectedStage = ["production", "stage"].includes($app.stage);

export const authTable = new sst.aws.Dynamo("AuthTable", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  ttl: "ttl",
  deletionProtection: isProtectedStage,
});

// OpenAuth issuer Lambda. `sst.aws.Auth` sets up a Function + Router +
// CloudFront distribution and exposes `.url` for the issuer.
//
// Hardening (H-I2):
//  - Custom domain (auth.<APP_DOMAIN>) when one is configured. CloudFront
//    issues an ACM cert and uses the SST default minimumProtocolVersion of
//    TLSv1.2_2021 (see .sst/platform/src/components/aws/cdn.ts).
//  - Without a custom domain we keep the default CloudFront URL so the
//    starter still deploys for users who haven't set APP_DOMAIN.
export const auth = new sst.aws.Auth("Auth", {
  issuer: {
    handler: "apps/auth/src/index.handler",
    link: [authTable],
    environment: {
      STAGE: $app.stage,
    },
  },
  ...(HAS_CUSTOM_DOMAIN ? { domain: AUTH_DOMAIN } : {}),
});
