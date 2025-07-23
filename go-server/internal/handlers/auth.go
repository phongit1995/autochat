package handlers

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/phongit1995/autochat/go-server/internal/models"
	"github.com/phongit1995/autochat/go-server/internal/services"
)

// AuthHandler handles authentication related requests
type AuthHandler struct {
	userRepo       *models.UserRepository
	sessionService *services.SessionService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(
	userRepo *models.UserRepository,
	sessionService *services.SessionService,
) *AuthHandler {
	return &AuthHandler{
		userRepo:       userRepo,
		sessionService: sessionService,
	}
}

// GetLogin handles GET /login - shows login page
func (h *AuthHandler) GetLogin(c *gin.Context) {
	// Render login page
	c.HTML(http.StatusOK, "login.html", gin.H{
		"title": "Login",
	})
}

// PostLogin handles POST /login - processes login form
func (h *AuthHandler) PostLogin(c *gin.Context) {
	username := strings.TrimSpace(c.PostForm("username"))
	password := strings.TrimSpace(c.PostForm("password"))

	if username == "" || password == "" {
		c.HTML(http.StatusBadRequest, "login.html", gin.H{
			"error": "Username and password are required",
			"title": "Login",
		})
		return
	}

	// Attempt login using browser automation
	token, err := services.BrowserLoginHandler(username, password)
	if err != nil {
		log.Printf("Login failed for user %s: %v", username, err)
		c.HTML(http.StatusUnauthorized, "login.html", gin.H{
			"error": "Invalid username or password",
			"title": "Login",
		})
		return
	}

	// Verify token and get user info
	userInfo, err := services.GetUserInfoFromToken(token)
	if err != nil {
		log.Printf("Token verification failed: %v", err)
		c.HTML(http.StatusInternalServerError, "login.html", gin.H{
			"error": "Login verification failed. Please try again.",
			"title": "Login",
		})
		return
	}

	// Get user info from the verified token
	cookie := getStringValue(userInfo, "cookie")

	// Check if user exists in database
	userDB, err := h.userRepo.FindUserByUsername(strings.ToLower(username))
	if err != nil {
		log.Printf("Database error: %v", err)
		c.HTML(http.StatusInternalServerError, "login.html", gin.H{
			"error": "Database error. Please try again.",
			"title": "Login",
		})
		return
	}

	// Create or update user in database
	if userDB == nil {
		// Create new user
		newUser := &models.User{
			Username:    strings.ToLower(username),
			Password:    password,
			Taisan:      getStringValue(userInfo, "taisan"),
			IDWeb:       getIntValue(userInfo, "idWeb"),
			ImageAvatar: getStringValue(userInfo, "avatar"),
		}

		err = h.userRepo.AddNewUser(newUser)
		if err != nil {
			log.Printf("Error creating user: %v", err)
		}
	} else {
		// Update existing user
		updates := &models.User{
			Password:    password,
			Taisan:      getStringValue(userInfo, "taisan"),
			ImageAvatar: getStringValue(userInfo, "avatar"),
		}

		err = h.userRepo.UpdateInfoUser(strings.ToLower(username), updates)
		if err != nil {
			log.Printf("Error updating user: %v", err)
		}
	}

	// Create session user
	sessionUser := &services.SessionUser{
		Username:    getStringValue(userInfo, "username"),
		Cookie:      cookie,
		Taisan:      getStringValue(userInfo, "taisan"),
		IDWeb:       getIntValue(userInfo, "idWeb"),
		ImageAvatar: getStringValue(userInfo, "avatar"),
		Gender:      getStringValue(userInfo, "gender"),
		Level:       getStringValue(userInfo, "level"),
	}

	// Store user in session
	err = h.sessionService.SetUser(c, sessionUser)
	if err != nil {
		log.Printf("Error setting user session: %v", err)
		c.HTML(http.StatusInternalServerError, "login.html", gin.H{
			"error": "Session error. Please try again.",
			"title": "Login",
		})
		return
	}

	log.Printf("User %s logged in successfully", username)
	c.Redirect(http.StatusFound, "/")
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	err := h.sessionService.ClearSession(c)
	if err != nil {
		log.Printf("Error clearing session: %v", err)
	}

	c.Redirect(http.StatusFound, "/")
}

// Helper functions to safely extract values from map[string]interface{}
func getStringValue(data map[string]interface{}, key string) string {
	if val, ok := data[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

func getIntValue(data map[string]interface{}, key string) int {
	if val, ok := data[key]; ok {
		if num, ok := val.(int); ok {
			return num
		}
		// Handle string conversion if needed
		if _, ok := val.(string); ok {
			return 0
		}
	}
	return 0
}
