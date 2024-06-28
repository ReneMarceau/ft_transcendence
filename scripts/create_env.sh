#!/bin/bash

# Reset
Reset='\033[0m'       # Text Reset

# Regular Colors
Black='\033[0;30m'        # Black
Red='\033[0;31m'          # Red
Green='\033[0;32m'        # Green
Yellow='\033[0;33m'       # Yellow
Blue='\033[0;34m'         # Blue
Purple='\033[0;35m'       # Purple
Cyan='\033[0;36m'         # Cyan
White='\033[0;37m'        # White

# Logging function
log() {
    echo -e "${Blue}[INFO] $1${Reset}"
}

error_log() {
    echo -e "${Red}[ERROR] $1${Reset}"
}

prompt_for_input() {
    local prompt_message=$1
    local input_variable

    while [ -z "$input_variable" ]; do
        echo -e -n "$prompt_message"
        read input_variable
        if [ -z "$input_variable" ]; then
            error_log "Input cannot be empty."
        fi
    done

    echo "$input_variable"
}

log "Starting .env file creation..."

# Prompt for database details
dataBaseNamePrompt=$(prompt_for_input "${Purple}Please enter the database name: ${Reset}")
databaseName="POSTGRES_DB=${dataBaseNamePrompt}"

dataBaseUserPrompt=$(prompt_for_input "${Green}Please enter your username for the database: ${Reset}")
databaseUser="POSTGRES_USER=${dataBaseUserPrompt}"

dataBasePasswordPrompt=$(prompt_for_input "${Yellow}Please enter your password for that user: ${Reset}")
databasePassword="POSTGRES_PASSWORD=${dataBasePasswordPrompt}"

log "Database details collected successfully."

# Write to .env at the root of the directory
echo -e "$databaseName\n$databaseUser\n$databasePassword" > .env
log ".env file created at the root directory."

# Setup variables for the .env in the backend (for Django)
POSTGRES_HOST="POSTGRES_HOST=postgres"
POSTGRES_PORT="POSTGRES_PORT=5432"

SECRET_KEY="SECRET_KEY=$(openssl rand -base64 48)"
DJANGO_ALLOWED_HOSTS="DJANGO_ALLOWED_HOSTS=$(hostname) localhost backend 127.0.0.1 [::1]"

log "Basic backend environment variables set up."

# Prompt for OAuth2 variables
log "To get OAuth2 application details, visit: https://profile.intra.42.fr/oauth/applications"
AUTH42_CLIENT=$(prompt_for_input "${Cyan}Please enter your AUTH42_CLIENT ID: ${Reset}")
AUTH42_SECRET=$(prompt_for_input "${Cyan}Please enter your AUTH42_SECRET: ${Reset}")
AUTH42_REDIRECT_URI=$(prompt_for_input "${Cyan}Please enter your AUTH42_REDIRECT_URI: ${Reset}")

log "OAuth2 details collected successfully."

# Write to backend/.env
echo -e "$POSTGRES_HOST\n$databaseUser\n$databasePassword\n$databaseName\n$POSTGRES_PORT\n\n$SECRET_KEY\n$DJANGO_ALLOWED_HOSTS\n\nAUTH42_CLIENT=${AUTH42_CLIENT}\nAUTH42_SECRET=${AUTH42_SECRET}\nAUTH42_REDIRECT_URI=${AUTH42_REDIRECT_URI}\n" > backend/.env
log "backend/.env file created."

log "Environment setup completed successfully."
