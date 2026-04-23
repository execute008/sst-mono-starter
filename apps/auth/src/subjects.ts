import { createSubjects } from "@openauthjs/openauth/subject";
import { object, optional, string } from "valibot";

// Shape of the authenticated subject embedded in the access token.
// Keep this importable by API handlers so they can type-check claims.
export const subjects = createSubjects({
  user: object({
    id: string(),
    provider: optional(string()),
    contact: optional(
      object({
        email: optional(string()),
        tel: optional(string()),
      }),
    ),
  }),
});
