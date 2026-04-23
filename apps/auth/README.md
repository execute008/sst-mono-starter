# @starter/auth

OpenAuth issuer Lambda. Stateless Hono app deployed via `sst.aws.Auth`.

- Subject schema: `src/subjects.ts`
- Issuer + providers: `src/index.ts`

## Adding a provider

```ts
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { GoogleProvider } from "@openauthjs/openauth/provider/google";

providers: {
  password: PasswordProvider(PasswordUI({ /* ... */ })),
  google: GoogleProvider({
    clientID: Resource.GOOGLE_CLIENT_ID.value,
    clientSecret: Resource.GOOGLE_CLIENT_SECRET.value,
    scopes: ["email", "profile"],
  }),
}
```

Then `link: [...]` the new secrets in `infra/auth.ts`.

## Verifying tokens

Clients send the access token as `Authorization: Bearer <jwt>`.
The Go API verifies against the issuer's JWKS at
`$AUTH_URL/.well-known/jwks.json` — see
`apps/api/internal/middleware/auth_guard.go`.
