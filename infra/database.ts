// Single-table DynamoDB for ElectroDB. Generous GSIs/LSIs reserved so you
// can add access patterns without replacing the table.
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
});

export const rateLimitTable = new sst.aws.Dynamo("rateLimit", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  ttl: "ttl",
});
