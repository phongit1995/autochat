package services

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
	"github.com/dgrijalva/jwt-go"
	"github.com/phongit1995/autochat/go-server/config"
)

func GetCookieFirstLogin() (string, error) {
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", false),
		chromedp.Flag("disable-gpu", false),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.WindowSize(1920, 1080),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	// Tạo browser context
	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	// Set timeout
	ctx, cancel = context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	var cookies []*network.Cookie

	// Chạy tasks
	err := chromedp.Run(ctx,
		// Bật network domain để có thể lấy cookies
		chromedp.ActionFunc(func(ctx context.Context) error {
			return network.Enable().Do(ctx)
		}),

		chromedp.Navigate("https://gaubong.us/"),

		chromedp.WaitVisible("body", chromedp.ByQuery),

		// Lấy cookies
		chromedp.ActionFunc(func(ctx context.Context) error {
			var err error
			cookies, err = network.GetCookies().Do(ctx)
			return err
		}),
	)

	if err != nil {
		return "", fmt.Errorf("lỗi khi chạy chromedp: %w", err)
	}

	var cookieStrings []string
	for _, cookie := range cookies {
		cookieStr := fmt.Sprintf("%s=%s", cookie.Name, cookie.Value)
		cookieStrings = append(cookieStrings, cookieStr)
	}

	cookiesHeader := strings.Join(cookieStrings, "; ")

	return cookiesHeader, nil
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
