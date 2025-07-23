package services

import (
	"fmt"
	"log"
	"net/url"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/rod/lib/proto"
	"github.com/go-rod/stealth"
	"github.com/phongit1995/autochat/go-server/config"
)

// BrowserLoginData contains login data from browser
type BrowserLoginData struct {
	Cookie    string `json:"cookie"`
	CSRFToken string `json:"csrf_token"`
}

// GetCookieFirstLogin uses Rod to get initial cookie and token
func GetCookieFirstLogin() (*BrowserLoginData, error) {
	// Create launcher with options
	launcher := launcher.New().
		Headless(true).
		NoSandbox(true).
		Set("disable-setuid-sandbox")

	browserURL, err := launcher.Launch()
	if err != nil {
		return nil, fmt.Errorf("failed to launch browser: %w", err)
	}

	// Create browser instance
	browser := rod.New().ControlURL(browserURL).MustConnect()
	defer browser.MustClose()

	// Create page with stealth mode
	page := stealth.MustPage(browser)

	// Set user agent
	err = page.SetUserAgent(&proto.NetworkSetUserAgentOverride{
		UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to set user agent: %w", err)
	}

	// Navigate to page
	err = page.Navigate("https://gaubong.us/")
	if err != nil {
		return nil, fmt.Errorf("failed to navigate: %w", err)
	}

	// Wait for page load
	err = page.WaitLoad()
	if err != nil {
		return nil, fmt.Errorf("failed to wait for page load: %w", err)
	}

	// Wait additional time for network idle
	time.Sleep(2 * time.Second)

	// Get cookies
	cookies, err := page.Cookies([]string{"https://gaubong.us"})
	if err != nil {
		return nil, fmt.Errorf("failed to get cookies: %w", err)
	}

	// Convert cookies to string
	var cookieStrings []string
	for _, cookie := range cookies {
		cookieStrings = append(cookieStrings, fmt.Sprintf("%s=%s", cookie.Name, cookie.Value))
	}

	// Get CSRF token from JavaScript store object
	var csrfToken string
	_, err = page.Eval(`() => {
		if (typeof store !== 'undefined' && store.csrf_token) {
			return store.csrf_token;
		}
		return '';
	}`, &csrfToken)
	if err != nil {
		log.Printf("Warning: Could not get CSRF token: %v", err)
		csrfToken = ""
	}

	return &BrowserLoginData{
		Cookie:    strings.Join(cookieStrings, "; "),
		CSRFToken: csrfToken,
	}, nil
}

// LoginWithBrowser performs login using browser automation
func LoginWithBrowser(username, password string, preCookie string, csrfToken string) (string, error) {
	// First try normal login
	formData := url.Values{}
	formData.Set("submit", "Đăng nhập")
	formData.Set("account", username)
	formData.Set("password", password)
	formData.Set("mem", "on")
	if csrfToken != "" {
		formData.Set("csrf_token", csrfToken)
	}

	client := createHTTPClient()
	req, err := createRequest("POST", "https://gaubong.us/login", strings.NewReader(formData.Encode()))
	if err != nil {
		return "", err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Cookie", preCookie)
	req.Header.Set("Referer", "https://gaubong.us")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36")

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Get cookies from response
	var cookieStrings []string
	for _, cookie := range resp.Cookies() {
		cookieStrings = append(cookieStrings, fmt.Sprintf("%s=%s", cookie.Name, cookie.Value))
	}

	// Combine with pre-cookie
	fullCookie := preCookie
	if len(cookieStrings) > 0 {
		fullCookie = preCookie + "; " + strings.Join(cookieStrings, "; ")
	}

	// Check login success by getting user info
	userInfo, err := GetUserInfo(fullCookie)
	if err != nil {
		return "", fmt.Errorf("login failed: %w", err)
	}

	// Create JWT token with user info
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": username,
		"cookie":   fullCookie,
		"userInfo": userInfo,
		"exp":      time.Now().Add(time.Hour * 12).Unix(),
	})

	tokenString, err := token.SignedString([]byte(config.AppConfig.JWTSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// GetUserInfo gets user information using cookie
func GetUserInfo(cookie string) (map[string]interface{}, error) {
	client := createHTTPClient()
	req, err := createRequest("GET", "https://gaubong.us/profile", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Cookie", cookie)
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Accept-Encoding", "")
	req.Header.Set("Accept-Language", "en-US,en;q=0.8")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// For now, return basic info structure
	// This would normally parse the HTML response to extract user data
	userInfo := map[string]interface{}{
		"username": "user",
		"taisan":   "0",
		"idWeb":    0,
		"avatar":   "",
		"gender":   "",
		"level":    "",
	}

	return userInfo, nil
}
