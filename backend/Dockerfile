# --- Builder Stage ---
# Use a specific version for reproducibility
ARG PB_VERSION=0.22.1
FROM alpine:3.20 as builder

# Install tools needed for download and extraction
RUN apk add --no-cache wget unzip

# Download and extract PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip -O /tmp/pb.zip && \
    unzip /tmp/pb.zip -d /app

# --- Final Stage ---
# Use a specific version for reproducibility
FROM alpine:3.20

# Install only necessary dependencies for running the application
RUN apk add --no-cache ca-certificates

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy PocketBase binary from the builder stage and set ownership
COPY --from=builder --chown=appuser:appgroup /app/pocketbase /app/pocketbase

# Copy migrations and set ownership. The pb_data directory should be mounted as a volume for persistence.
COPY --chown=appuser:appgroup pb_migrations ./pb_migrations

# Switch to the non-root user
USER appuser

# Expose the port PocketBase will run on
EXPOSE 8080

# Start PocketBase
# The serve command will automatically create and use a pb_data directory if it doesn't exist.
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080"]