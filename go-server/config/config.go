package config

import (
	"log"
	"os"
)

// Config holds application configuration
type Config struct {
	Port      string
	MongoURI  string
	JWTSecret string
}

// AppConfig is the global config instance
var AppConfig *Config

// LoadConfig loads configuration from environment variables
func LoadConfig() {
	AppConfig = &Config{
		Port:      getEnv("PORT", "8080"),
		MongoURI:  getEnv("MONGO_DB", "mongodb+srv://admin:admin@mangareader.yvcxh.mongodb.net/app-chat?authSource=admin&replicaSet=atlas-cs0b4p-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true"),
		JWTSecret: getEnv("JWT_SECRET", "phong-nguyen-secret-key"),
	}

	log.Printf("Config loaded - Port: %s, MongoDB: %s", AppConfig.Port, AppConfig.MongoURI)
}

// getEnv gets environment variable with fallback
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
