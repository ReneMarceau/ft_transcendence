#!/bin/bash

# Collect static files
echo "Collect static files"
python manage.py collectstatic --noinput

# Apply database migrations
echo "Apply database migrations"
python manage.py makemigrations
python manage.py migrate

# Start server
echo "Starting server"
# Start the development server with SSL
daphne -e ssl:8000:privateKey=/app/certs/nginx.key:certKey=/app/certs/nginx.crt app.asgi:application
