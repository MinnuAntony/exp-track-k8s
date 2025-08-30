# --- Build Stage ---
FROM golang:1.21-alpine AS builder

RUN apk add --no-cache git 

WORKDIR /app

# Copy all source code, including go.mod and go.sum
COPY . .

# Download dependencies and tidy the go.sum file
# This will download all modules listed in go.mod and update go.sum
RUN go mod tidy

# Build the final binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o expense-service main.go

# --- Run Stage ---
FROM scratch

COPY --from=builder /app/expense-service /expense-service

USER 1000:1000
EXPOSE 8080
CMD ["/expense-service"]
