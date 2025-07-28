package main

import (
	"html/template"
	"log"
	"net/http"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/phongit1995/autochat/go-server/config"
	"github.com/phongit1995/autochat/go-server/internal/handlers"
	"github.com/phongit1995/autochat/go-server/internal/middleware"
	"github.com/phongit1995/autochat/go-server/internal/models"
	"github.com/phongit1995/autochat/go-server/internal/services"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Connect to database
	if err := models.ConnectDatabase(config.AppConfig.MongoURI); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize services
	userRepo := models.NewUserRepository(models.DB)
	sessionService := services.NewSessionService()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, sessionService)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(sessionService)

	// Setup Gin router
	r := gin.Default()

	// Setup custom template functions
	r.SetFuncMap(template.FuncMap{
		"upper": strings.ToUpper,
		"slice": func(s string, i, j int) string {
			if i >= len(s) {
				return ""
			}
			if j > len(s) {
				j = len(s)
			}
			return s[i:j]
		},
	})

	// Setup session middleware
	store := cookie.NewStore([]byte(config.AppConfig.JWTSecret))
	store.Options(sessions.Options{
		MaxAge:   60 * 60 * 12, // 12 hours
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		Path:     "/",
	})
	r.Use(sessions.Sessions("autochat-session", store))

	// Setup static files
	r.Static("/public", "./public")
	r.LoadHTMLGlob("templates/*")

	// Routes
	setupRoutes(r, authHandler, authMiddleware)

	// Start server
	log.Printf("Server starting on port %s", config.AppConfig.Port)
	if err := r.Run(":" + config.AppConfig.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRoutes(r *gin.Engine, authHandler *handlers.AuthHandler, authMiddleware *middleware.AuthMiddleware) {
	// Public routes
	r.GET("/login", authMiddleware.GuestOnly(), authHandler.GetLogin)
	r.POST("/login", authMiddleware.GuestOnly(), authHandler.PostLogin)

	// Protected routes
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": "AutoChat Dashboard",
		})
	})

	r.GET("/logout", authMiddleware.RequireAuth(), authHandler.Logout)

	// API routes
	api := r.Group("/api")
	api.Use(authMiddleware.RequireAuth())
	{
		api.GET("/user", func(c *gin.Context) {
			user := c.MustGet("user").(*services.SessionUser)
			c.JSON(http.StatusOK, gin.H{
				"user": user,
			})
		})
	}
}
