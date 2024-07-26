# Variables
PROJECT_NAME = transcendence
DOCKER = docker
DOCKER_COMPOSE = docker-compose
DJANGO_MANAGE = $(DOCKER_COMPOSE) exec backend python manage.py

# Colors 
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[0;33m
BLUE=\033[0;34m
PURPLE=\033[0;35m
CYAN=\033[0;36m
RESET=\033[0m

all:
	@echo "${RED}Please specify a command.${RESET}"
	@make help

# Show available commands
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  ${GREEN}make build${RESET}             - Build the Docker containers"
	@echo "  ${GREEN}make up${RESET}                - Start the Docker containers"
	@echo "  ${GREEN}make down${RESET}              - Stop the Docker containers"
	@echo "  ${GREEN}make restart${RESET}           - Restart the Docker containers"
	@echo "  ${GREEN}make migrate${RESET}           - Apply Django migrations"
	@echo "  ${GREEN}make createsuperuser${RESET}   - Create a Django superuser"
	@echo "  ${GREEN}make clean${RESET}             - Remove Docker containers and images"
	@echo "  ${GREEN}make deploy / re${RESET}       - Deploy the application"
	@echo "  ${GREEN}make check${RESET}             - Check if all dependencies are installed"
	@echo "  ${GREEN}make install${RESET}           - Install Python dependencies"
	@echo "  ${GREEN}make format-front${RESET}      - Run formater for frontend"
	@echo "  ${GREEN}make format-back${RESET}       - Run formater for backend"

# Build the Docker containers
.PHONY: build
build: check
	@echo "${YELLOW}Building Docker containers...${RESET}"
	@$(DOCKER_COMPOSE) up --build -d
	@echo "${GREEN}Build complete.${RESET}"

# Start the Docker containers
.PHONY: up
up: migrate
	@echo "${YELLOW}Starting Docker containers...${RESET}"
	@$(DOCKER_COMPOSE) up

# Stop the Docker containers
.PHONY: down
down:
	@echo "${YELLOW}Stopping Docker containers...${RESET}"
	@$(DOCKER_COMPOSE) down
	@echo "${GREEN}Containers stopped.${RESET}"

# Stop and restart the Docker containers
.PHONY: restart
restart: down up
	@echo "${GREEN}Containers restarted.${RESET}"

# Apply Django migrations to the database
.PHONY: migrate
migrate:
	@echo "${YELLOW}Applying Django migrations...${RESET}"
	@$(DJANGO_MANAGE) makemigrations
	@$(DJANGO_MANAGE) migrate
	@echo "${GREEN}Migrations applied.${RESET}"

# Create a Django superuser for the admin panel
.PHONY: createsuperuser
createsuperuser:
	@echo "${YELLOW}Creating Django superuser...${RESET}"
	@$(DJANGO_MANAGE) createsuperuser
	@echo "${GREEN}Superuser created.${RESET}"

# Remove Docker containers and images
.PHONY: clean
clean: down
	@echo "${YELLOW}Removing Docker containers and images...${RESET}"
	@$(DOCKER_COMPOSE) down --rmi all -v --remove-orphans
	@find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
	@find . -path "*/migrations/*.pyc"  -delete
	@rm -rf frontend/dist
	@echo "${GREEN}Clean complete.${RESET}"

# Deploy the application
.PHONY: deploy re
deploy re: clean check build
	@echo "${YELLOW}Deploying application...${RESET}"
	@$(DOCKER_COMPOSE) up
	@echo "${GREEN}Deployment complete.${RESET}"

# Check if all required dependencies are functional
.PHONY: check
check: venv
	@if ! $(DOCKER) info > /dev/null 2>&1; then \
		echo "${RED}Docker is not running.${RESET}"; \
		exit 1; \
	fi
	@if [ ! -f ".env" ]; then \
		echo "${YELLOW}.env file not found. Executing script to create...${RESET}"; \
		bash scripts/create_env.sh; \
	fi
	@if [ ! -f "nginx/certs/nginx.crt" ] || [ ! -f "nginx/certs/nginx.key" ]; then \
		echo "${YELLOW}SSL certificates not found. Generating...${RESET}"; \
		mkdir -p nginx/certs; \
		openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout nginx/certs/nginx.key -out nginx/certs/nginx.crt -subj "/CN=localhost"; \
		echo "${GREEN}SSL certificates generated.${RESET}"; \
	fi
	@echo "Before starting backend development, run ${CYAN}make install${RESET} to install Python dependencies."

# Check if venv is present then create it
.PHONY: venv
venv:
	@if [ ! -d "backend/venv/" ]; then \
		echo "${YELLOW}Virtual environment not found. Creating...${RESET}"; \
		python3 -m venv backend/venv; \
		echo "${GREEN}Virtual environment created.${RESET}"; \
	fi
	@if [ -z "${VIRTUAL_ENV}" ]; then \
		echo "${YELLOW}You need to activate the virtual environment. Run: ${CYAN}source backend/venv/bin/activate${RESET}"; \
		exit 1; \
	fi

# Install Python dependencies
.PHONY: install
install: venv
	@echo "${YELLOW}Installing Python dependencies...${RESET}"
	@pip install --upgrade pip
	@pip install -r backend/requirements.txt
	@echo "${GREEN}Dependencies installed.${RESET}"

# Run formater for frontend
.PHONY: format-front
format-front:
	@echo "${YELLOW}Running formater...${RESET}"
	@cd frontend && npm run format
	@cd frontend && npm run lint
	@echo "${GREEN}Formating complete.${RESET}"

# Run formater for backend
.PHONY: format-back
format-back: check install
	@echo "${YELLOW}Running formater...${RESET}"
	@cd backend && python -m black .
	@echo "${GREEN}Formating complete.${RESET}"
