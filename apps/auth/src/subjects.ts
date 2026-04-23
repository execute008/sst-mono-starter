import { createSubjects } from "@openauthjs/openauth/subject";
import {
  email,
  maxLength,
  nonEmpty,
  object,
  optional,
  pipe,
  regex,
  string,
} from "valibot";

// Shape of the authenticated subject embedded in the access token.
// Keep this importable by API handlers so they can type-check claims.
//
// Validators are tightened to reject malformed inputs at JWT-issue time:
// - `id` is a non-empty bounded string (DB-friendly subject identifier).
// - `contact.email` enforces RFC email shape and a length cap.
// - `contact.tel` enforces E.164 (`+` then 7-15 digits, leading non-zero).
export const subjects = createSubjects({
  user: object({
    id: pipe(string(), nonEmpty(), maxLength(64)),
    provider: optional(pipe(string(), maxLength(32))),
    contact: optional(
      object({
        email: optional(pipe(string(), email(), maxLength(254))),
        tel: optional(pipe(string(), regex(/^\+[1-9]\d{6,14}$/))),
      }),
    ),
  }),
});
