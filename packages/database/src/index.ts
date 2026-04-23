import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Entity, Service } from "electrodb";
import { Resource } from "sst";

export const dynamo = new DynamoDBClient({});

// `Resource.electro.name` comes from the Dynamo resource defined in
// `infra/database.ts` — it's available on any function linked to `table`.
const tableName = (Resource as any).electro?.name ?? process.env.ELECTRO_TABLE_NAME!;

export const UserEntity = new Entity(
  {
    model: {
      entity: "user",
      version: "1",
      service: "starter",
    },
    attributes: {
      userId: { type: "string", required: true },
      email: { type: "string" },
      createdAt: { type: "string", default: () => new Date().toISOString() },
    },
    indexes: {
      primary: {
        pk: { field: "pk", composite: ["userId"] },
        sk: { field: "sk", composite: [] },
      },
    },
  },
  { client: dynamo, table: tableName },
);

export const starterService = new Service(
  { user: UserEntity },
  { client: dynamo, table: tableName },
);

export type StarterService = typeof starterService;
