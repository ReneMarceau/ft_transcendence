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

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  ${GREEN}make build${RESET}             - Build the Docker containers"
	@echo "  ${GREEN}make up${RESET}                - Start the Docker containers"
	@echo "  ${GREEN}make down${RESET}              - Stop the Docker containers"
	@echo "  ${GREEN}make restart${RESET}           - Restart the Docker containers"
	@echo "  ${GREEN}make migrate${RESET}           - Apply Django migrations"
	@echo "  ${GREEN}make createsuperuser${RESET}    - Create a Django superuser"
	@echo "  ${GREEN}make shell${RESET}             - Open Django shell"
	@echo "  ${GREEN}make test${RESET}              - Run tests"
	@echo "  ${GREEN}make clean${RESET}             - Remove Docker containers and images"
	@echo "  ${GREEN}make deploy${RESET}            - Deploy the application"
	@echo "  ${GREEN}make check${RESET}             - Check if all dependencies are installed"

.PHONY: build
build: check
	@echo "${YELLOW}Building Docker containers...${RESET}"
	@$(DOCKER_COMPOSE) up --build -d
	@echo "${GREEN}Build complete.${RESET}"

.PHONY: up
up: build migrate
	@echo "${YELLOW}Starting Docker containers...${RESET}"
	@$(DOCKER_COMPOSE) up

.PHONY: down
down:
	@echo "${YELLOW}Stopping Docker containers...${RESET}"
	@$(DOCKER_COMPOSE) down
	@echo "${GREEN}Containers stopped.${RESET}"

.PHONY: restart
restart: down up
	@echo "${GREEN}Containers restarted.${RESET}"

.PHONY: migrate
migrate:
	@echo "${YELLOW}Applying Django migrations...${RESET}"
	@$(DJANGO_MANAGE) makemigrations
	@$(DJANGO_MANAGE) migrate
	@echo "${GREEN}Migrations applied.${RESET}"

.PHONY: createsuperuser
createsuperuser:
	@echo "${YELLOW}Creating Django superuser...${RESET}"
	@$(DJANGO_MANAGE) createsuperuser
	@echo "${GREEN}Superuser created.${RESET}"

.PHONY: test
test:
	@echo "${YELLOW}Running tests...${RESET}"
	@$(DJANGO_MANAGE) test
	@echo "${GREEN}Tests completed.${RESET}"

.PHONY: clean
clean: down
	@echo "${YELLOW}Removing Docker containers and images...${RESET}"
	@$(DOCKER_COMPOSE) down --rmi all -v --remove-orphans
	@echo "${GREEN}Clean complete.${RESET}"

.PHONY: deploy
deploy: check clean build migrate
	@echo "${YELLOW}Deploying application...${RESET}"
	@$(DOCKER_COMPOSE) up
	@echo "${GREEN}Deployment complete.${RESET}"

.PHONY: check
check:
	@if [ ! -f ".env" ]; then \
		echo "${YELLOW}.env file not found. Executing script to create...${RESET}"; \
		bash scripts/create_env.sh; \
	fi
	@if [ ! -f "nginx/certs/nginx.crt" ] || [ ! -f "nginx/certs/nginx.key" ]; then \
		echo "${YELLOW}SSL certificates not found. Generating...${RESET}"; \
		mkdir -p nginx/certs; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/certs/nginx.key -out nginx/certs/nginx.crt -subj "/CN=localhost"; \
		echo "${GREEN}SSL certificates generated.${RESET}"; \
	fi
