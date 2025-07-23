package services

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/phongit1995/autochat/go-server/config"
)

// BrowserLoginHandler handles browser login process
func BrowserLoginHandler(username, password string) (string, error) {
	// Get initial cookie and token
	loginData, err := GetCookieFirstLogin()
	if err != nil {
		return "", fmt.Errorf("failed to get initial cookie: %w", err)
	}

	// Perform login with browser
	return LoginWithBrowser(username, password, loginData.Cookie, loginData.CSRFToken)
}

// GetUserInfoFromToken extracts user info from JWT token
func GetUserInfoFromToken(tokenString string) (map[string]interface{}, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(config.AppConfig.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Extract user info from claims
		userInfo := make(map[string]interface{})

		if username, ok := claims["username"].(string); ok {
			userInfo["username"] = username
		}

		if cookie, ok := claims["cookie"].(string); ok {
			userInfo["cookie"] = cookie
		}

		if userInfoClaim, ok := claims["userInfo"].(map[string]interface{}); ok {
			// Copy all user info fields
			for key, value := range userInfoClaim {
				userInfo[key] = value
			}
		}

		return userInfo, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// createHTTPClient creates HTTP client with timeout
func createHTTPClient() *http.Client {
	return &http.Client{
		Timeout: 30 * time.Second,
	}
}

// createRequest creates HTTP request with common headers
func createRequest(method, url string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36")
	return req, nil
}

// Additional functions that were referenced in browser_auth.go can be added here...
