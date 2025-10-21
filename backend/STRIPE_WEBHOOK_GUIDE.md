# Stripe Webhook Integration Guide

## Overview

This guide explains how the Stripe webhook integration works with your PocketBase products collection.

## Products Collection Schema

Your products collection has the following fields:

- `id` - 15 character auto-generated ID
- `name` - Product name
- `slug` - URL-friendly product identifier
- `price` - Product price in VND
- `stock` - Available stock quantity
- `description` - Product description
- `category` - Relation to categories collection
- `images` - Multiple image files
- `isFeatured` - Boolean flag for featured products
- `isAvailable` - Boolean flag for product availability
- `stripe_product_id` - Stripe product ID for sync
- `created` - Auto-generated creation timestamp
- `updated` - Auto-generated update timestamp

## Webhook Events Handled

### 1. `product.created` & `product.updated`

When a product is created or updated in Stripe, the webhook will:

**Direct Mappings:**

- `product.name` → `name`
- `product.description` → `description`
- `product.id` → `stripe_product_id`
- `product.active` → `isAvailable`

**Generated Fields:**

- `slug` - Auto-generated from product name (lowercase, hyphenated)

**Metadata Mappings:**
To fully utilize all fields, add these metadata keys in Stripe:

- `metadata.featured` → `isFeatured` (set to "true" or "false")
- `metadata.price` → `price` (fallback if default_price not available)
- `metadata.stock` → `stock`
- `metadata.category_id` → `category` (must match a PocketBase category ID)

**Images:**

- ✅ Stripe product images are automatically downloaded and uploaded to PocketBase
- Images are fetched from Stripe URLs and saved to the `images` field
- Supports multiple image formats (JPG, PNG, WebP, GIF)
- Filename format: `{stripe_product_id}-{index}.{extension}`
- Failed image downloads won't prevent product sync

### 2. `price.created` & `price.updated`

When a price is created or updated in Stripe:

- Automatically updates the `price` field in the linked product
- Handles VND currency (amounts are already in correct format)
- Only processes prices attached to products

### 3. `checkout.session.completed`

Handles completed checkout sessions (existing functionality preserved)

## Setting Up Products in Stripe

### Option 1: Via Stripe Dashboard

1. Create a product in Stripe Dashboard
2. Add metadata:
   ```
   featured: true
   stock: 100
   category_id: your_pocketbase_category_id
   ```
3. Set the default price in VND
4. The webhook will sync to PocketBase automatically

### Option 2: Via Stripe API

```javascript
const product = await stripe.products.create({
  name: 'Red9 Handgun',
  description: 'Powerful 9mm handgun from RE4',
  active: true,
  metadata: {
    featured: 'true',
    stock: '50',
    category_id: 'abc123xyz456789', // Your PocketBase category ID
  },
  images: ['https://example.com/red9.jpg'],
});

const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 450000, // 450,000 VND
  currency: 'vnd',
});
```

## Environment Variables Required

Make sure these are set in your PocketBase environment:

```bash
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production # or development
FRONTEND_URL=https://your-domain.com # for production
```

## Webhook Configuration in Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/stripe`
3. Select events to listen for:
   - `product.created`
   - `product.updated`
   - `price.created`
   - `price.updated`
   - `checkout.session.completed`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing Webhooks

### Local Testing with Stripe CLI:

```bash
stripe listen --forward-to http://localhost:8090/stripe
stripe trigger product.created
stripe trigger price.updated
```

### Manual Product Creation Test:

1. Create a product in Stripe with metadata
2. Check PocketBase products collection
3. Verify all fields are synced correctly

## Limitations & Notes

### Image Sync

- ✅ Stripe product images are automatically downloaded and synced
- Images are downloaded from Stripe CDN and uploaded to PocketBase
- Supports multiple images per product (up to 99 as per schema)
- Failed downloads are logged but won't break the sync
- Image format detection is automatic based on URL and content-type

### Stock Management

- Stripe doesn't have native stock management
- Stock is managed via metadata
- You need to update stock manually or via API
- Consider implementing stock decrease on order completion

### Category Linking

- Category must exist in PocketBase first
- Use the exact PocketBase category ID in Stripe metadata
- Invalid category IDs are logged but won't break the sync

### Price Currency

- Currently optimized for VND
- Stripe amounts are in smallest currency unit
- For VND, this is already the correct value (no cents)

## Recommended Workflow

1. **Create Category in PocketBase** (if needed)
2. **Create Product in Stripe** with full metadata
3. **Create Price in Stripe** for the product
4. **Webhook automatically syncs** to PocketBase (including images!)
5. **Verify in PocketBase** that all fields and images are correct

## Future Enhancements

Consider implementing:

- [x] ✅ Automated image download and upload (DONE!)
- [ ] Stock decrement on order completion
- [ ] Bulk product sync endpoint
- [ ] Product deletion webhook handler
- [ ] Inventory alerts when stock is low
- [ ] Multi-currency support
- [ ] Product variant support (if needed)
