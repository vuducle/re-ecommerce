FROM alpine:latest
# Install necessary packages
RUN apk add --no-cache ca-certificates

# Set working directory
WORKDIR /app

# Copy PocketBase binary
COPY pocketbase /app/pocketbase

# Copy data and migrations
#COPY pb_migrations /app/pb_migrations

# Make PocketBase binary executable
RUN chmod +x /app/pocketbase

# Expose the port PocketBase will run on
EXPOSE 8080

# Command to run PocketBase
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8080"]