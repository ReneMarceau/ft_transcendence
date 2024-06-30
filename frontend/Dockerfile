# Use the official Node.js image from the Docker Hub
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

RUN npm install -g three
RUN npm install -g browser-sync
RUN npm install jwt-decode

# Copy the rest of the application code into the container
COPY . .

# Expose the port browser-sync will run on
EXPOSE 3000

# Default command to run the application
CMD ["npm", "start"]
