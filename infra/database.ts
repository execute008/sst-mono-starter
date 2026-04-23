// Single-table DynamoDB for ElectroDB. Generous GSIs/LSIs reserved so you
// can add access patterns without replacing the table.
//
// Hardening (H-I1):
//  - PITR is on by default in `sst.aws.Dynamo` — no extra config required.
//  - Deletion protection is enabled on protected stages (production, stage)
//    so an accidental `sst remove` cannot wipe the table.
const isProtectedStage = ["production", "stage"].includes($app.stage);

export const table = new sst.aws.Dynamo("electro", {
  fields: {
    pk: "string",
    sk: "string",
    gsi1pk: "string",
    gsi1sk: "string",
    gsi2pk: "string",
    gsi2sk: "string",
    gsi3pk: "string",
    gsi3sk: "string",
    lsi1sk: "string",
    lsi2sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  globalIndexes: {
    GSI1: { hashKey: "gsi1pk", rangeKey: "gsi1sk" },
    GSI2: { hashKey: "gsi2pk", rangeKey: "gsi2sk" },
    GSI3: { hashKey: "gsi3pk", rangeKey: "gsi3sk" },
  },
  localIndexes: {
    LSI1: { rangeKey: "lsi1sk" },
    LSI2: { rangeKey: "lsi2sk" },
  },
  deletionProtection: isProtectedStage,
});

// Rate-limit table is ephemeral (TTL'd counters) — skip PITR to save cost,
// but still protect against accidental delete on production/stage.
export const rateLimitTable = new sst.aws.Dynamo("rateLimit", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  ttl: "ttl",
  deletionProtection: isProtectedStage,
  transform: {
    table: (args) => {
      // Override SST's default of pointInTimeRecovery.enabled = true. PITR
      // adds ~20% to storage cost and is wasted on ephemeral TTL data.
      args.pointInTimeRecovery = { enabled: false };
    },
  },
});
