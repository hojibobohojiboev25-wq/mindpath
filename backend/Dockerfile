FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directory for images
RUN mkdir -p public/images

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]