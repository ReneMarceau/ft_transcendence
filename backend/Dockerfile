FROM python:latest

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gettext \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY backend/requirements.txt /app/

# Install Python dependencies
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy the entire backend project directory to the container
COPY backend /app/

# Copy SSL certificates to the container
COPY nginx/certs /app/certs

# Expose the port the app runs on
EXPOSE 8000

ENTRYPOINT [ "sh", "entrypoint.sh" ]
