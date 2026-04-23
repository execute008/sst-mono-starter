package config

import (
	"log"
	"os"
)

type Config struct {
	Stage              string
	AuthURL            string
	TableName          string
	RateLimitTableName string
	PublicAssetsBucket string
	AWSRegion          string
}

func Load() *Config {
	authURL := os.Getenv("AUTH_URL")
	if authURL == "" {
		log.Fatal("AUTH_URL environment variable is required")
	}

	tableName := os.Getenv("ELECTRO_TABLE_NAME")
	if tableName == "" {
		log.Fatal("ELECTRO_TABLE_NAME environment variable is required")
	}

	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "eu-central-1"
	}

	return &Config{
		Stage:              os.Getenv("STAGE"),
		AuthURL:            authURL,
		TableName:          tableName,
		RateLimitTableName: os.Getenv("RATE_LIMIT_TABLE_NAME"),
		PublicAssetsBucket: os.Getenv("PUBLIC_ASSETS_BUCKET"),
		AWSRegion:          region,
	}
}
