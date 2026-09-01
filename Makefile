.PHONY: dev up down test clean

# Start the full stack locally with hot-reload (if configured) or standard docker
dev:
	@echo "🚀 Starting PKML development environment..."
	docker-compose up --build

# Start in detached mode
up:
	docker-compose up -d

# Stop all containers
down:
	docker-compose down

# Run basic validation checks
test:
	@echo "🧪 Running backend validation..."
	cd backend && python -m py_compile server.py
	@echo "🧪 Running frontend build check..."
	cd frontend && yarn build

# Clean up containers, volumes, and dangling images
clean:
	docker-compose down -v
	docker system prune -f
