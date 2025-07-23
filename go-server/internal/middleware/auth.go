package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/phongit1995/autochat/go-server/internal/services"
)

// AuthMiddleware provides authentication middleware functionality
type AuthMiddleware struct {
	sessionService *services.SessionService
}

// NewAuthMiddleware creates a new auth middleware
func NewAuthMiddleware(sessionService *services.SessionService) *AuthMiddleware {
	return &AuthMiddleware{
		sessionService: sessionService,
	}
}

// RequireAuth middleware checks if user is authenticated
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if user is logged in
		if !m.sessionService.IsLoggedIn(c) {
			c.Redirect(http.StatusFound, "/login")
			c.Abort()
			return
		}

		// Get user from session and add to context
		user, err := m.sessionService.GetUser(c)
		if err != nil {
			c.Redirect(http.StatusFound, "/login")
			c.Abort()
			return
		}

		// Add user to context for use in handlers
		c.Set("user", user)
		c.Next()
	}
}

// GuestOnly middleware redirects authenticated users away from guest-only pages
func (m *AuthMiddleware) GuestOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		if m.sessionService.IsLoggedIn(c) {
			c.Redirect(http.StatusFound, "/")
			c.Abort()
			return
		}
		c.Next()
	}
}

// OptionalAuth middleware adds user to context if authenticated, but doesn't require it
func (m *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		if m.sessionService.IsLoggedIn(c) {
			user, err := m.sessionService.GetUser(c)
			if err == nil {
				c.Set("user", user)
			}
		}
		c.Next()
	}
}
