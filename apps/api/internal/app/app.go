package app

import (
	"log"

	"github.com/example/starter-api/internal/config"
	"github.com/example/starter-api/internal/handlers"
	"github.com/example/starter-api/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

// New builds the Fiber app. Routes are grouped under /v2 because the SST
// Router mounts this Lambda on the /v2 prefix (the path is NOT stripped).
func New(cfg *config.Config) *fiber.App {
	app := fiber.New(fiber.Config{
		ErrorHandler: customErrorHandler,
	})

	app.Use(recover.New())
	app.Use(logger.New())
	if cfg.AllowedOrigins != "" {
		app.Use(cors.New(cors.Config{
			AllowOrigins: cfg.AllowedOrigins,
			AllowHeaders: "Content-Type, Authorization",
			AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		}))
	}

	v2 := app.Group("/v2")

	// Health is registered before constructing the auth guard so liveness
	// checks still respond if the issuer's JWKS endpoint is unreachable.
	v2.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"stage":   cfg.Stage,
			"service": "starter-api",
		})
	})

	authGuard, err := middleware.NewAuthGuard(cfg.AuthURL)
	if err != nil {
		log.Printf("auth guard: cold-start failed, fail-closed mode: %v", err)
		stub := middleware.FailClosedGuard(err)
		v2.Get("/me", stub, handlers.GetMe)
		v2.Get("/public", stub, handlers.GetPublic)
		return app
	}

	v2.Get("/me", authGuard.Middleware(&middleware.AuthGuardOptions{Optional: false}), handlers.GetMe)
	v2.Get("/public", authGuard.Middleware(&middleware.AuthGuardOptions{Optional: true}), handlers.GetPublic)

	return app
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}
	return c.Status(code).JSON(fiber.Map{"error": message})
}
