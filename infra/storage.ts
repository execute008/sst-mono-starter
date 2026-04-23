// S3 buckets:
//  - privateAssetsBucket: requires signed URLs (private uploads)
//  - publicAssetsBucket:  served publicly through the API Router/CloudFront
//                         (NOT a wildcard public-read bucket policy)
//
// SST Bucket defaults that already harden us:
//  - Block public access is ON
//  - `enforceHttps: true` adds an `aws:SecureTransport=false` Deny statement
//
// What we add:
//  - `versioning: true` on both buckets (recover from accidental delete/overwrite)
//  - leave `access` unset so the bucket policy stays private (no `Principal: *`)
//
// TODO(infra): Server-access logs. Wiring access logs requires a second log
// bucket + a BucketLogging resource. Skipped here to avoid scope creep — add
// when you have a central log bucket. See:
//   https://docs.aws.amazon.com/AmazonS3/latest/userguide/ServerLogs.html

export const privateAssetsBucket = new sst.aws.Bucket("PrivateAssets", {
  versioning: true,
});

export const publicAssetsBucket = new sst.aws.Bucket("PublicAssets", {
  // NOTE: deliberately NOT `access: "public"`.
  // `access: "public"` would attach a `Principal: "*" / s3:GetObject` bucket
  // policy AND disable S3 Block Public Access — turning the bucket into a
  // wildcard-readable bucket. Instead we keep it private and front it with
  // CloudFront via the shared Router (see infra/api.ts → router.routeBucket).
  versioning: true,
});
