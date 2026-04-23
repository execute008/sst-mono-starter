// S3 buckets:
//  - privateAssetsBucket: requires signed URLs (private uploads)
//  - publicAssetsBucket:  publicly readable (published assets, optimized images)

export const privateAssetsBucket = new sst.aws.Bucket("PrivateAssets");

export const publicAssetsBucket = new sst.aws.Bucket("PublicAssets", {
  access: "public",
});
