#!/bin/sh
# Runtime environment variable injection script for Next.js in Docker

set -e

# Function to escape JSON special characters
escape_json() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

# Create the runtime config file
cat > /app/public/__env.js <<EOF
window.__RUNTIME_CONFIG__ = {
  NEXT_PUBLIC_POCKETBASE_URL: "$(escape_json "${NEXT_PUBLIC_POCKETBASE_URL:-http://127.0.0.1:8090}")",
  NEXT_PUBLIC_ENABLE_ADD_TO_CART: "$(escape_json "${NEXT_PUBLIC_ENABLE_ADD_TO_CART:-true}")"
};
EOF

echo "Runtime environment variables injected:"
cat /app/public/__env.js

# Start the Next.js server
exec node server.js
