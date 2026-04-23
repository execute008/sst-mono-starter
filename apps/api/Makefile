.PHONY: help build build-lambda run test fmt clean tidy

help:
	@echo "make build        - Build the Go application"
	@echo "make build-lambda - Build the bootstrap binary for AWS Lambda"
	@echo "make run          - Run the application locally"
	@echo "make test         - Run tests"
	@echo "make fmt          - Format Go code"
	@echo "make clean        - Clean build artifacts"
	@echo "make tidy         - Run go mod tidy"

build:
	go build -o bin/api .

build-lambda:
	go build -o bootstrap main.go

run:
	go run main.go

test:
	go test ./... -v

fmt:
	go fmt ./...

clean:
	rm -rf bin/ bootstrap

tidy:
	go mod tidy
