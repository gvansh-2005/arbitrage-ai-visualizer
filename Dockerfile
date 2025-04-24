
# Use Node.js LTS as base image
FROM node:20-slim

# Install system dependencies including WebGPU requirements
RUN apt-get update && apt-get install -y \
    libegl1 \
    libgl1-mesa-glx \
    libxcb-xfixes0-dev \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "run", "dev"]
