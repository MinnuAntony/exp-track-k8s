# --- Build Stage ---
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy dependency files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build static, stripped binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o expense-service main.go

# --- Run Stage ---
FROM scratch

# Copy CA certificates for HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the statically linked binary
COPY --from=builder /app/expense-service /expense-service

# Create a non-root user (ID 1000) and switch
# Note: scratch has no /etc/passwd, but USER with UID/GID works
USER 1000:1000

# Expose port
EXPOSE 8080

# Run the binary
CMD ["/expense-service"]

