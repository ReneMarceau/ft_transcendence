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
	@echo "  ${GREEN}make logs${RESET}              - Tail the Docker logs"
	@echo "  ${GREEN}make migrate${RESET}           - Apply Django migrations"
	@echo "  ${GREEN}make createsuperuser${RESET}    - Create a Django superuser"
	@echo "  ${GREEN}make shell${RESET}             - Open Django shell"
	@echo "  ${GREEN}make test${RESET}              - Run tests"
	@echo "  ${GREEN}make clean${RESET}             - Remove Docker containers and images"
	@echo "  ${GREEN}make deploy${RESET}            - Deploy the application"

.PHONY: build
build: check
	@echo "${YELLOW}Building Docker containers...${RESET}"
	@$(DOCKER_COMPOSE) up --build
	@echo "${GREEN}Build complete.${RESET}"

.PHONY: up
up:
	@echo "${YELLOW}Starting Docker containers...${RESET}"
	@$(DOCKER_COMPOSE) up
	@echo "${GREEN}Containers are up and running.${RESET}"

.PHONY: down
down:
	@echo "${YELLOW}Stopping Docker containers...${RESET}"
	@$(DOCKER_COMPOSE) down
	@echo "${GREEN}Containers stopped.${RESET}"

.PHONY: restart
restart: down up
	@echo "${GREEN}Containers restarted.${RESET}"

.PHONY: logs
logs:
	@echo "${YELLOW}Tailing Docker logs...${RESET}"
	@$(DOCKER_COMPOSE) logs -f

.PHONY: migrate
migrate:
	@echo "${YELLOW}Applying Django migrations...${RESET}"
	@$(DJANGO_MANAGE) migrate
	@echo "${GREEN}Migrations applied.${RESET}"

.PHONY: createsuperuser
createsuperuser:
	@echo "${YELLOW}Creating Django superuser...${RESET}"
	@$(DJANGO_MANAGE) createsuperuser
	@echo "${GREEN}Superuser created.${RESET}"

.PHONY: shell
shell:
	@echo "${YELLOW}Opening Django shell...${RESET}"
	@$(DJANGO_MANAGE) shell

.PHONY: shell-frontend
shell-front:
	@echo "${YELLOW}Opening bash shell in frontend container...${RESET}"
	@$(DOCKER) exec -it frontend bash

.PHONY: shell-back
shell-back:
	@echo "${YELLOW}Opening bash shell in backend container...${RESET}"
	@$(DOCKER) exec -it backend bash

.PHONY: shell-db
shell-db:
	@echo "${YELLOW}Opening bash shell in db container...${RESET}"
	@$(DOCKER) exec -it db bash

.PHONY: test
test:
	@echo "${YELLOW}Running tests...${RESET}"
	@$(DJANGO_MANAGE) test
	@echo "${GREEN}Tests completed.${RESET}"

.PHONY: clean
clean:
	@echo "${YELLOW}Removing Docker containers and images...${RESET}"
	@$(DOCKER_COMPOSE) down --rmi all -v --remove-orphans
	@echo "${GREEN}Clean complete.${RESET}"

.PHONY: deploy
deploy: clean build migrate
	@echo "${YELLOW}Deploying application...${RESET}"
	@$(DOCKER_COMPOSE) up
	@echo "${GREEN}Deployment complete.${RESET}"

.PHONY: check
check:
	@if [ ! -d "backend/venv/" ]; then \
		echo "${YELLOW}Virtual environment not found. Creating...${RESET}"; \
		$(DOCKER_COMPOSE) exec backend python -m venv venv; \
		echo "${GREEN}Virtual environment created.${RESET}"; \
	fi
	@if [ -z "${VIRTUAL_ENV}" ]; then \
		echo "${YELLOW}You need to activate the virtual environment. Run: source backend/venv/bin/activate${RESET}"; \
		exit 1; \
	fi
	@if [ ! -f ".env" ]; then \
		echo "${YELLOW}.env file not found. Executing script to create...${RESET}"; \
		bash scripts/create_env.sh; \
	fi