.PHONY: all up down build fmt help

# Default target
.DEFAULT_GOAL := help

# Build Go backend
build: ## Build the Go backend
	@docker compose build backend
	@echo "$(GREEN)✅ Backend built successfully!$(RESET)"

# Start the application with Docker Compose
up: ## Start the application
	@docker compose up -d

# Stop the application
down: ## Stop the application
	@docker compose down -v

# Format Go code
fmt: ## Format all Go code files
	@gofmt -w .
	@echo "$(GREEN)✅ Go code formatted successfully!$(RESET)"

# Clean up Docker containers
clean: ## Remove all containers
	@docker rm -f go-backend swagger-ui 2>/dev/null || true

help: ## Display this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}'
