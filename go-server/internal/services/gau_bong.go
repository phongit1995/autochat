package services

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
)

func GetCookieBrowserLogin() (string, error) {
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

func RequestLoginWebsite(username string, password string, cookie string) (string, error) {
	data := url.Values{}
	data.Set("submit", "Đăng nhập")
	data.Set("account", username)
	data.Set("password", password)
	data.Set("mem", "on")
	req, err := http.NewRequest("POST", "https://gaubong.us/login", strings.NewReader(data.Encode()))
	if err != nil {
		log.Println("Error creating request:", err)
		return "", err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Postman-Token", "f20afd7e-8400-4eb2-8a4d-2b2451b81c73")
	req.Header.Set("cache-control", "no-cache")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Host", "gaubong.us")
	req.Header.Set("Referer", "https://gaubong.us")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36")
	req.Header.Set("cookie", cookie)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending request:", err)
		return "", err
	}
	log.Println("Response:", resp)
	defer resp.Body.Close()
	return "", nil
}
