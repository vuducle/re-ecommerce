# Image Loading Debug Guide

## Current Error Analysis

You're getting a 400 Bad Request error for:

```
https://ducworld.com/_next/image?url=https%3A%2F%2Fapi.ducworld.com%2Fapi%2Ffiles%2Fpbc_3292755704%2Fxdh6zvw9k4r5ez5%2Fbgp3hcn5hbbk_zx9e2ojult.jpg&w=1200&q=75
```

## Debugging Steps

### 1. Check Environment Variables

Make sure your `.env` (or environment) has:

```env
NEXT_PUBLIC_POCKETBASE_URL=https://api.ducworld.com
```

### 2. Test Direct Image URL

Try accessing the image directly:

```
https://api.ducworld.com/api/files/pbc_3292755704/xdh6zvw9k4r5ez5/bgp3hcn5hbbk_zx9e2ojult.jpg
```

### 3. Check CORS Headers

Your PocketBase backend at `api.ducworld.com` needs to allow your frontend domain:

- Frontend: `ducworld.com`
- Backend: `api.ducworld.com`

### 4. Alternative Solutions

If the issue persists, you can:

#### Option A: Disable Image Optimization for External Images

Add to `next.config.ts`:

```typescript
images: {
  unoptimized: true, // This disables Next.js image optimization
}
```

#### Option B: Use `unoptimized` prop on specific images

```jsx
<Image
  src={imageUrl}
  alt="Product image"
  unoptimized={true}
  width={400}
  height={300}
/>
```

#### Option C: Proxy images through your API

Create an API route to proxy images from PocketBase.

## Next Steps

1. Update your `next.config.ts` (already done ✅)
2. Verify your environment variables
3. Test the direct image URL
4. Check your PocketBase CORS settings
5. If needed, use the `unoptimized` fallback

## Quick Fix (if all else fails)

You can temporarily disable image optimization by adding `unoptimized={true}` to your Image components.
