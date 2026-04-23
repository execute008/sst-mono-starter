package middleware

import (
	"context"
	"log"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type AuthGuardOptions struct {
	Optional bool
}

// AuthGuard verifies OpenAuth-issued JWTs via the issuer's JWKS endpoint
// (`$AUTH_URL/.well-known/jwks.json`). Keys are cached and refreshed in the
// background by `keyfunc`.
type AuthGuard struct {
	jwks keyfunc.Keyfunc
}

// User is the subject extracted from a verified access token. Fields mirror
// the OpenAuth `subjects.ts` schema in `apps/auth/src/subjects.ts`.
type User struct {
	ID       string
	Provider string
	Contact  *Contact
}

type Contact struct {
	Email string
	Tel   string
}

type userContextKey struct{}

// NewAuthGuard panics if the JWKS cannot be fetched at cold-start — the API
// is useless without it, so fail fast.
func NewAuthGuard(authURL string) *AuthGuard {
	jwksURL := strings.TrimRight(authURL, "/") + "/.well-known/jwks.json"

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	jwks, err := keyfunc.NewDefaultCtx(ctx, []string{jwksURL})
	if err != nil {
		log.Fatalf("auth guard: failed to load JWKS from %s: %v", jwksURL, err)
	}
	return &AuthGuard{jwks: jwks}
}

func (ag *AuthGuard) Middleware(options *AuthGuardOptions) fiber.Handler {
	return func(c *fiber.Ctx) error {
		optional := options != nil && options.Optional

		header := c.Get("Authorization")
		if header == "" {
			if optional {
				return c.Next()
			}
			return unauth(c, "Unauthorized")
		}

		token := strings.TrimPrefix(header, "Bearer ")
		if token == header {
			return unauth(c, "Invalid authorization header format")
		}

		user, err := ag.verify(token)
		if err != nil {
			if optional {
				return c.Next()
			}
			log.Printf("auth guard: token verification failed: %v", err)
			return unauth(c, "Invalid token")
		}

		c.Locals(userContextKey{}, user)
		return c.Next()
	}
}

// GetUser returns the subject attached by a successful auth-guard pass.
func GetUser(c *fiber.Ctx) (*User, bool) {
	user, ok := c.Locals(userContextKey{}).(*User)
	return user, ok
}

func (ag *AuthGuard) verify(tokenStr string) (*User, error) {
	parsed, err := jwt.Parse(tokenStr, ag.jwks.Keyfunc)
	if err != nil {
		return nil, err
	}
	if !parsed.Valid {
		return nil, jwt.ErrTokenInvalidClaims
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return nil, jwt.ErrTokenInvalidClaims
	}

	// OpenAuth packs the subject under `properties` (the value you returned
	// from the issuer's `success` handler).
	props, _ := claims["properties"].(map[string]any)
	if props == nil {
		props = map[string]any{}
	}

	user := &User{
		ID:       asString(props["id"]),
		Provider: asString(props["provider"]),
	}
	if contact, ok := props["contact"].(map[string]any); ok {
		user.Contact = &Contact{
			Email: asString(contact["email"]),
			Tel:   asString(contact["tel"]),
		}
	}
	return user, nil
}

func asString(v any) string {
	s, _ := v.(string)
	return s
}

func unauth(c *fiber.Ctx, msg string) error {
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": msg})
}
