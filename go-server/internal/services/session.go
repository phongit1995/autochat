package services

import (
	"encoding/json"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/phongit1995/autochat/go-server/internal/models"
)

// SessionUser represents user data stored in session
type SessionUser struct {
	Username    string `json:"username"`
	Cookie      string `json:"cookie"`
	Taisan      string `json:"taisan"`
	IDWeb       int    `json:"idweb"`
	ImageAvatar string `json:"imageavatar"`
	Gender      string `json:"gender"`
	Level       string `json:"level"`
}

// SessionService handles session operations
type SessionService struct{}

// NewSessionService creates a new session service
func NewSessionService() *SessionService {
	return &SessionService{}
}

// SetUser stores user data in session
func (s *SessionService) SetUser(c *gin.Context, user *SessionUser) error {
	session := sessions.Default(c)

	userData, err := json.Marshal(user)
	if err != nil {
		return err
	}

	session.Set("user", string(userData))
	session.Set("login_time", time.Now().Unix())

	return session.Save()
}

// GetUser retrieves user data from session
func (s *SessionService) GetUser(c *gin.Context) (*SessionUser, error) {
	session := sessions.Default(c)

	userData := session.Get("user")
	if userData == nil {
		return nil, nil
	}

	var user SessionUser
	err := json.Unmarshal([]byte(userData.(string)), &user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// SetPreCookie stores pre-login cookie data
func (s *SessionService) SetPreCookie(c *gin.Context, cookie, token string) error {
	session := sessions.Default(c)
	session.Set("preCookie", cookie)
	session.Set("token", token)
	return session.Save()
}

// GetPreCookie retrieves pre-login cookie data
func (s *SessionService) GetPreCookie(c *gin.Context) (string, string) {
	session := sessions.Default(c)

	preCookie := session.Get("preCookie")
	token := session.Get("token")

	cookieStr := ""
	tokenStr := ""

	if preCookie != nil {
		cookieStr = preCookie.(string)
	}

	if token != nil {
		tokenStr = token.(string)
	}

	return cookieStr, tokenStr
}

// IsLoggedIn checks if user is logged in
func (s *SessionService) IsLoggedIn(c *gin.Context) bool {
	user, _ := s.GetUser(c)
	return user != nil
}

// ClearSession clears all session data
func (s *SessionService) ClearSession(c *gin.Context) error {
	session := sessions.Default(c)
	session.Clear()
	return session.Save()
}

// FromUser converts models.User to SessionUser
func (s *SessionService) FromUser(user *models.User, cookie string) *SessionUser {
	return &SessionUser{
		Username:    user.Username,
		Cookie:      cookie,
		Taisan:      user.Taisan,
		IDWeb:       user.IDWeb,
		ImageAvatar: user.ImageAvatar,
	}
}
