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
# python manage.py runserver_plus --cert-file /app/certs/nginx.crt --key-file /app/certs/nginx.key 0.0.0.0:8000
# python manage.py runserver 0.0.0.0:8000
# gunicorn --bind 0.0.0.0:8000 app.wsgi:application
