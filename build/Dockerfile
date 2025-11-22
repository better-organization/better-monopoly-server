# ---- Build stage ----
FROM rust:1.75-alpine AS builder

# Install required dependencies for building
RUN apk add --no-cache musl-dev

WORKDIR /usr/src/app

# Copy Cargo.toml and Cargo.lock first (for caching deps)
COPY Cargo.toml Cargo.lock ./

# Create a dummy src/main.rs so `cargo build` can resolve dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies (this will be cached unless Cargo.toml/lock changes)
RUN cargo build --release || true

# Now copy the real source code
COPY . .

# Build the real binary
RUN cargo build --release

# ---- Runtime stage ----
FROM alpine:latest AS runtime

# Install CA certificates for HTTPS calls
RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /usr/src/app/target/release/better-monopoly-server /app/better-monopoly-server

# Expose the port your app listens on
EXPOSE 8080

# Run the binary
CMD ["./better-monopoly-server"]