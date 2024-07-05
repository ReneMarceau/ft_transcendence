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
    local type=$1
    local message=$2

    if [ "$type" == "INFO" ]; then
        echo -e "${Blue}[INFO] ${White}$message${Reset}"
    elif [ "$type" == "PROMPT" ]; then
        echo -en "${Green}[PROMPT] ${White}$message${Reset}"
    elif [ "$type" == "ERROR" ]; then
        echo -e "${Red}[ERROR] ${White}$message${Reset}"
    else
        echo -e "${Red}[ERROR] ${White}Invalid log type${Reset}"
    fi
}

log "INFO" "Starting .env file creation..."

# Prompt for database details
while [ -z "$dataBaseNamePrompt" ]; do
    log "PROMPT" "Please enter the database name: "
    read dataBaseNamePrompt
    if [ -z "$dataBaseNamePrompt" ]; then
        log "ERROR" "Database name cannot be empty."
    fi
done
databaseName="POSTGRES_DB=${dataBaseNamePrompt}"

while [ -z "$dataBaseUserPrompt" ]; do
    log "PROMPT" "Please enter the username for the database: "
    read dataBaseUserPrompt
    if [ -z "$dataBaseUserPrompt" ]; then
        log "ERROR" "Username cannot be empty."
    fi
done
databaseUser="POSTGRES_USER=${dataBaseUserPrompt}"

while [ -z "$dataBasePasswordPrompt" ]; do
    log "PROMPT" "Please enter the password for the database: "
    read dataBasePasswordPrompt
    if [ -z "$dataBasePasswordPrompt" ]; then
        log "ERROR" "Password cannot be empty."
    fi
done
databasePassword="POSTGRES_PASSWORD=${dataBasePasswordPrompt}"

log "INFO" "Database details collected successfully."

# Setup variables for the .env in the backend (for Django)
POSTGRES_HOST="POSTGRES_HOST=postgres"
POSTGRES_PORT="POSTGRES_PORT=5432"

SECRET_KEY="SECRET_KEY=$(openssl rand -base64 48)"
DJANGO_ALLOWED_HOSTS="DJANGO_ALLOWED_HOSTS=$(hostname) localhost backend 127.0.0.1 [::1]"

# Prompt for OAuth2 variables
log "INFO" "To get OAuth2 application details, visit: https://profile.intra.42.fr/oauth/applications"

while [ -z "$AUTH42_CLIENT" ]; do
    log "PROMPT" "Please enter your AUTH42_CLIENT ID: "
    read AUTH42_CLIENT
    if [ -z "$AUTH42_CLIENT" ]; then
        log "ERROR" "AUTH42_CLIENT ID cannot be empty."
    fi
done
AUTH42_CLIENT="AUTH42_CLIENT=${AUTH42_CLIENT}"

while [ -z "$AUTH42_SECRET" ]; do
    log "PROMPT" "Please enter your AUTH42_SECRET: "
    read AUTH42_SECRET
    if [ -z "$AUTH42_SECRET" ]; then
        log "ERROR" "AUTH42_SECRET cannot be empty."
    fi
done
AUTH42_SECRET="AUTH42_SECRET=${AUTH42_SECRET}"

log "INFO" "OAuth2 details collected successfully."

# Write to .env at the root of the directory
log "INFO" ".env file created at the root directory."
echo -e "$databaseName\n$databaseUser\n$databasePassword" > .env
# Write to backend/.env
log "INFO" "backend/.env file created."
echo -e "$POSTGRES_HOST\n$databaseUser\n$databasePassword\n$databaseName\n$POSTGRES_PORT\n\n$SECRET_KEY\n$DJANGO_ALLOWED_HOSTS\n\n$AUTH42_CLIENT\n$AUTH42_SECRET\n" > backend/.env

log "INFO" "Environment setup completed successfully."
