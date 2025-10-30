# Checkout Configuration Fix

## Problem

Stripe checkout redirects to `localhost:3000` instead of your production domain.

## Root Cause

The backend `pb_hooks/main.pb.js` checks environment variables to determine redirect URLs, but these weren't set correctly.

## Solution

### Required Environment Variables in `.env`:

```env
# Backend needs these for Stripe checkout redirects
NODE_ENV=production
FRONTEND_URL=https://ducworld.com

# Also required
STRIPE_API_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
isProduction=production
```

### Changes Made:

1. **Updated `backend/pb_hooks/main.pb.js`:**

   - Now checks both `NODE_ENV` and `isProduction`
   - Uses `FRONTEND_URL` for success/cancel redirects

2. **Updated `docker-compose.yml`:**

   - Added `NODE_ENV` to backend environment variables

3. **Updated `.env.example`:**
   - Added `NODE_ENV=production`

## Deploy the Fix

```bash
# Make sure your .env has:
NODE_ENV=production
FRONTEND_URL=https://ducworld.com

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

## Verify

After checkout, you should be redirected to:

- ✅ Success: `https://ducworld.com/checkout/success`
- ✅ Cancel: `https://ducworld.com/checkout`

Not:

- ❌ `http://localhost:3000/checkout/success`
- ❌ `http://localhost:3000/checkout`

## Testing

1. Add items to cart
2. Go to checkout
3. Complete Stripe payment
4. Should redirect to your domain, not localhost
