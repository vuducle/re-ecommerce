# Docker + Caddy Deployment Fix Guide

## Problem

Frontend running in Docker is trying to connect to `127.0.0.1:8090` instead of your actual backend URL (`api.ducworld.com`).

## Root Cause

`NEXT_PUBLIC_*` environment variables in Next.js are **baked into the JavaScript bundle at BUILD time**, not runtime. If they're not set correctly during the Docker build, the app defaults to `127.0.0.1:8090`.

## Solution Steps

### 1. Create/Update your `.env` file

Create a `.env` file in the project root with:

```env
NEXT_PUBLIC_POCKETBASE_URL=https://api.ducworld.com
FRONTEND_URL=https://ducworld.com
PB_ADMIN_EMAIL=your-admin@email.com
PB_ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_ENABLE_ADD_TO_CART=true
isProduction=production
STRIPE_API_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook
```

**IMPORTANT**: `NEXT_PUBLIC_POCKETBASE_URL` must be the PUBLIC URL that browsers can access!

### 2. Rebuild Your Containers

The environment variables need to be available during the BUILD process:

```bash
# Stop containers
docker-compose down

# Rebuild with --build flag (this is crucial!)
docker-compose up --build -d

# Check logs to verify
docker-compose logs -f frontend
```

### 3. Verify the Configuration

#### Check if environment variable is being used:

```bash
# Enter the frontend container
docker exec -it re-ecommerce-frontend sh

# Check the runtime config
cat /app/public/__env.js

# Should output something like:
# window.__RUNTIME_CONFIG__ = {
#   NEXT_PUBLIC_POCKETBASE_URL: "https://api.ducworld.com",
#   ...
# };
```

#### Test in browser console:

Open your browser console on `https://ducworld.com` and run:

```javascript
// Check runtime config
console.log(window.__RUNTIME_CONFIG__);

// Check if fetch is using correct URL
console.log('PB_URL should be: https://api.ducworld.com');
```

### 4. Verify Your Caddy Configuration

Your Caddyfile should look something like this:

```caddy
# Frontend
ducworld.com {
    reverse_proxy frontend:3000
}

# Backend API
api.ducworld.com {
    reverse_proxy backend:8080
}
```

### 5. Check PocketBase CORS Settings

Your PocketBase needs to allow requests from your frontend domain. You can configure this in PocketBase settings or via environment variables.

## Troubleshooting

### Still seeing 127.0.0.1:8090?

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

2. **Check if .env file is in the correct location**:

   ```bash
   ls -la .env
   # Should show .env in your project root
   ```

3. **Verify Docker is reading the .env file**:

   ```bash
   docker-compose config
   # This shows the resolved configuration with environment variables
   ```

4. **Check the build logs**:
   ```bash
   docker-compose build frontend --no-cache
   # Look for any errors during build
   ```

### Connection Refused Errors?

1. **Check if backend is running**:

   ```bash
   docker-compose ps
   # Both frontend and backend should be "Up"
   ```

2. **Test backend directly**:

   ```bash
   curl https://api.ducworld.com/api/health
   # Should return a successful response
   ```

3. **Check network configuration**:
   ```bash
   docker network inspect caddy
   # Both containers should be on the caddy network
   ```

### Auth/Featured Products Not Working?

This is likely a CORS issue. Check your PocketBase logs:

```bash
docker-compose logs backend | grep -i cors
docker-compose logs backend | grep -i origin
```

## Quick Test Commands

```bash
# Test backend health
curl https://api.ducworld.com/api/health

# Test frontend health
curl https://ducworld.com

# Check container environment
docker exec re-ecommerce-frontend env | grep NEXT_PUBLIC

# Watch logs in real-time
docker-compose logs -f --tail=50
```

## Final Checklist

- [ ] `.env` file exists in project root
- [ ] `NEXT_PUBLIC_POCKETBASE_URL=https://api.ducworld.com` is set
- [ ] Containers rebuilt with `docker-compose up --build -d`
- [ ] Browser cache cleared
- [ ] Caddy is routing correctly
- [ ] PocketBase CORS allows `ducworld.com`
- [ ] Both containers are on the `caddy` network

## Expected Behavior After Fix

✅ Browser console should show: `GET https://api.ducworld.com/api/collections/products/records...`
✅ No more `127.0.0.1:8090` references
✅ Auth and featured products work correctly
