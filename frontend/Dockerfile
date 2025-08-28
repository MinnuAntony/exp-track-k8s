# Use a Node.js image to build the React application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install all the project dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the React application for production
RUN npm run build

# --- Run Stage ---
# Use a lightweight Nginx image to serve the static frontend files
FROM nginx:1.25.3-alpine

# Copy the built production files from the builder stage into Nginx's web root
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

