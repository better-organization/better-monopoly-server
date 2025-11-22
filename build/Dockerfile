# ---- Build stage ----
FROM ghcr.io/rust-lang/rust:latest as builder

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
FROM ghcr.io/debian:bookworm-slim AS runtime

# Install minimal certificates (if your app calls HTTPS APIs)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ⚠️ IMPORTANT: replace `your_binary_name` with your actual binary name
# e.g., if package is `[package] name = "monopoly-backend"`, the binary is usually that name
COPY --from=builder /usr/src/app/target/release/better-monopoly-server /app/better-monopoly-server

# Expose the port your app listens on (adjust if different)
EXPOSE 8080

CMD ["sh", "-c", "echo 'Container starting on Render...'; pwd; ls -R .; echo 'Running server...'; ./better-monopoly-server"]