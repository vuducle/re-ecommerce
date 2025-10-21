# Customer Collection

## Overview

The `customer` collection stores the relationship between PocketBase users and Stripe customers. This allows the system to track which Stripe customer ID belongs to which user.

## Schema

| Field                | Type     | Required | Unique | Description                               |
| -------------------- | -------- | -------- | ------ | ----------------------------------------- |
| `id`                 | text     | Yes      | Yes    | 15-character auto-generated ID            |
| `stripe_customer_id` | text     | Yes      | Yes    | Stripe customer ID (starts with `cus_`)   |
| `user_id`            | relation | Yes      | Yes    | Reference to `_pb_users_auth_` collection |
| `created`            | autodate | No       | No     | Creation timestamp                        |
| `updated`            | autodate | No       | No     | Last update timestamp                     |

## Indexes

- **Unique index on `stripe_customer_id`** - Ensures each Stripe customer is only stored once
- **Unique index on `user_id`** - Ensures each user can only have one customer record (one-to-one relationship)

## Access Rules

### List Rule

```javascript
@request.auth.id != "" && user_id = @request.auth.id
```

Users can only list their own customer record.

### View Rule

```javascript
@request.auth.id != "" && user_id = @request.auth.id
```

Users can only view their own customer record.

### Create/Update/Delete Rules

```javascript
null;
```

These operations are handled by the backend hooks only, not by users directly.

## Usage in Webhooks

The customer collection is used in:

1. **`/create-checkout-session`** endpoint

   - Checks if user already has a Stripe customer
   - Creates new Stripe customer if not found
   - Saves the relationship locally

2. **`checkout.session.completed`** webhook
   - Looks up the user by their Stripe customer ID
   - Creates order records linked to the correct user

## Example Data

```json
{
  "id": "abc123xyz456789",
  "stripe_customer_id": "cus_ABC123xyz",
  "user_id": "user_xyz789abc123",
  "created": "2025-10-21 10:30:00.000Z",
  "updated": "2025-10-21 10:30:00.000Z"
}
```

## Relationship Diagram

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│                 │       │                  │       │                 │
│  users          │◄──────│  customer        │───────►  Stripe API     │
│  (_pb_users_    │  1:1  │                  │       │  (cus_xxx)      │
│   auth_)        │       │                  │       │                 │
│                 │       │                  │       │                 │
└─────────────────┘       └──────────────────┘       └─────────────────┘
        │                                                     │
        │                                                     │
        │                                                     │
        ▼                                                     ▼
┌─────────────────┐                               ┌─────────────────────┐
│                 │                               │                     │
│  orders         │                               │  Stripe Checkout    │
│                 │                               │  Session            │
│                 │                               │                     │
└─────────────────┘                               └─────────────────────┘
```

## Migration

The migration file `1729519200_created_customer.js` will:

- Create the `customer` collection
- Set up the unique indexes
- Configure the access rules

To apply the migration:

1. Restart PocketBase
2. The migration will run automatically
3. Check the admin UI to verify the collection exists

## Benefits

✅ **Tracks Stripe customers locally** - No need to query Stripe API every time  
✅ **One-to-one relationship** - Each user has exactly one Stripe customer  
✅ **Fast lookups** - Indexed for quick queries  
✅ **Secure** - Users can only see their own customer data  
✅ **Automatic cleanup** - Cascade delete when user is deleted
