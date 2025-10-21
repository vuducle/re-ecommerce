/**
 * This file contains PocketBase hooks.
 *
 * The collections schema is managed by the migration files in the `pb_migrations` directory.
 * PocketBase automatically applies these migrations on startup.
 *
 * The code below sets up a webhook handler for Stripe.
 */

routerAdd('POST', '/stripe', async (e) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || ''; // webhook secret

  const info = e.requestInfo();
  let signature = info.headers['stripe_signature'] || '';
  const rawBody = readerToString(e.request.body);
  signature = signature.split(',').reduce((accum, x) => {
    const [k, v] = x.split('=');
    return { ...accum, [k]: v };
  }, {});
  $app.logger().info('Received data:', 'json', signature);

  const hash = $security.hs256(`${signature.t}.${rawBody}`, secret);

  const isValid = $security.equal(hash, signature.v1);
  if (!isValid) {
    throw new BadRequestError(`Invalid webhook signature.`);
  }
  const data = info.body;
  $app.logger().info('Received data:', 'json', data);

  switch (data.type) {
    case 'product.created':
    case 'product.updated':
      try {
        const product = data.data.object;
        const collection = $app.findCollectionByNameOrId('products');
        let record;

        try {
          // Find existing product by stripe_product_id
          record = $app.findFirstRecordByData(
            'products',
            'stripe_product_id',
            product.id
          );
        } catch (e) {
          // Create new product if not found
          record = new Record(collection);
          record.set('stripe_product_id', product.id);
        }

        // Map Stripe product data to PocketBase products collection
        record.set('name', product.name || '');
        record.set('description', product.description || '');

        // Generate slug from name if not already set
        if (!record.get('slug') && product.name) {
          const slug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          record.set('slug', slug);
        }

        // Set product availability based on Stripe's active status
        record.set('isAvailable', product.active || false);

        // Set featured status from Stripe metadata if available
        if (product.metadata && product.metadata.featured) {
          record.set(
            'isFeatured',
            product.metadata.featured === 'true'
          );
        }

        // Handle default price from Stripe (if default_price is expanded)
        if (
          product.default_price &&
          typeof product.default_price === 'object'
        ) {
          const priceInVND = product.default_price.unit_amount || 0;
          record.set('price', priceInVND);
        } else if (product.metadata && product.metadata.price) {
          // Fallback to metadata price if available
          record.set(
            'price',
            parseFloat(product.metadata.price) || 0
          );
        }

        // Handle stock from metadata (Stripe doesn't have built-in stock management)
        if (product.metadata && product.metadata.stock) {
          record.set(
            'stock',
            parseFloat(product.metadata.stock) || 0
          );
        }

        // Handle category from metadata
        if (product.metadata && product.metadata.category_id) {
          try {
            const categoryRecord = $app.findRecordById(
              'categories',
              product.metadata.category_id
            );
            if (categoryRecord) {
              record.set('category', product.metadata.category_id);
            }
          } catch (err) {
            $app
              .logger()
              .warn(
                'Category not found:',
                product.metadata.category_id
              );
          }
        }

        // Auto-download and upload images from Stripe
        if (product.images && product.images.length > 0) {
          try {
            const uploadedFiles = [];

            for (let i = 0; i < product.images.length; i++) {
              const imageUrl = product.images[i];

              try {
                // Download the image from Stripe
                const imageResponse = await $http.send({
                  url: imageUrl,
                  method: 'GET',
                });

                if (
                  imageResponse.statusCode === 200 &&
                  imageResponse.raw
                ) {
                  // Generate a filename from the URL or use a default
                  const urlParts = imageUrl.split('/');
                  const originalFilename =
                    urlParts[urlParts.length - 1] ||
                    `product-${i}.jpg`;

                  // Determine file extension from URL or content type
                  let extension = 'jpg';
                  if (originalFilename.includes('.')) {
                    extension = originalFilename.split('.').pop();
                  } else if (imageResponse.headers['content-type']) {
                    const contentType =
                      imageResponse.headers['content-type'];
                    if (contentType.includes('png'))
                      extension = 'png';
                    else if (contentType.includes('webp'))
                      extension = 'webp';
                    else if (contentType.includes('gif'))
                      extension = 'gif';
                  }

                  // Create a unique filename
                  const filename = `${product.id}-${i}.${extension}`;

                  // Create a file from the downloaded bytes
                  const file = new File(
                    [imageResponse.raw],
                    filename
                  );
                  uploadedFiles.push(file);

                  $app.logger().info('Downloaded image:', filename);
                }
              } catch (imgErr) {
                $app
                  .logger()
                  .error(
                    'Failed to download image:',
                    imageUrl,
                    imgErr
                  );
              }
            }

            // Upload all downloaded files to the record
            if (uploadedFiles.length > 0) {
              record.set('images', uploadedFiles);
              $app
                .logger()
                .info(
                  'Uploaded images to product:',
                  uploadedFiles.length
                );
            }
          } catch (err) {
            $app.logger().error('Error processing images:', err);
            // Don't fail the entire sync if images fail
          }
        }

        $app.save(record);
        $app.logger().info('Product saved:', record.id);
      } catch (err) {
        $app.logger().error('Error processing product:', err);
        throw new BadRequestError(
          'Failed to process product: ' + err.message
        );
      }
      break;

    case 'price.created':
    case 'price.updated':
      try {
        const price = data.data.object;

        // Only handle prices attached to products
        if (!price.product) {
          $app.logger().warn('Price has no associated product');
          break;
        }

        // Find the product by stripe_product_id
        let productRecord;
        try {
          productRecord = $app.findFirstRecordByData(
            'products',
            'stripe_product_id',
            price.product
          );
        } catch (err) {
          $app
            .logger()
            .warn('Product not found for price:', price.product);
          break;
        }

        // Update the price (Stripe amounts are in smallest currency unit)
        // For VND, amount is already in the correct format
        if (
          price.unit_amount !== null &&
          price.unit_amount !== undefined
        ) {
          productRecord.set('price', price.unit_amount);
          $app.save(productRecord);
          $app
            .logger()
            .info('Product price updated:', productRecord.id);
        }
      } catch (err) {
        $app.logger().error('Error processing price:', err);
        throw new BadRequestError(
          'Failed to process price: ' + err.message
        );
      }
      break;

    case 'checkout.session.completed':
      try {
        const session = data.data.object;
        if (session.mode === 'payment') {
          // Handle one-time payment
          const customer = $app.findFirstRecordByData(
            'customer',
            'stripe_customer_id',
            session.customer
          );
          const userId = customer.get('user_id');

          const ordersCollection =
            $app.findCollectionByNameOrId('orders');
          const orderRecord = new Record(ordersCollection);

          orderRecord.set('user', userId);
          orderRecord.set('status', 'pending');
          orderRecord.set('totalAmount', session.amount_total / 100);
          orderRecord.set(
            'shippingAddress',
            session.customer_details.address
          );

          // To get the line items, we need to make an API call to Stripe
          const apiKey = process.env.STRIPE_API_KEY || ''; // IMPORTANT: Replace with your Stripe API key
          const lineItemsResponse = await $http.send({
            url: `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items`,
            method: 'GET',
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          });

          if (
            lineItemsResponse.statusCode === 200 &&
            lineItemsResponse.json.data
          ) {
            orderRecord.set('items', lineItemsResponse.json.data);
          } else {
            $app
              .logger()
              .error(
                'Failed to retrieve line items:',
                lineItemsResponse.json
              );
          }

          $app.save(orderRecord);
        }
      } catch (err) {
        $app
          .logger()
          .error('Error processing checkout session:', err);
        throw new BadRequestError(
          'Failed to process checkout session: ' + err.message
        );
      }
      break;
    default:
      // Not handling other event types like price.*, customer.subscription.*
      $app.logger().info('Unhandled event type:', data.type);
  }
  return e.json(200, { message: 'Data received successfully' });
});

routerAdd('POST', '/create-checkout-session', async (e) => {
  try {
    const apiKey = process.env.STRIPE_API_KEY || '';
    const info = e.requestInfo();
    const token = info.headers['authorization'] || '';
    let userRecord;
    try {
      userRecord = await $app.findAuthRecordByToken(token, 'auth');
    } catch (error) {
      return e.json(401, { message: 'User not authorized' });
    }

    const existingCustomer = $app.findRecordsByFilter(
      'customer',
      `user_id = "${userRecord.id}"`
    );

    let customerId;

    try {
      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].getString(
          'stripe_customer_id'
        );
      } else {
        const customerResponse = await $http.send({
          url: 'https://api.stripe.com/v1/customers',
          method: 'POST',
          headers: {
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            email: userRecord.getString('email'),
            name: userRecord.getString('displayName'),
            metadata: {
              pocketbaseUUID: userRecord.id,
            },
          }),
        });

        customerId = customerResponse.json.id;

        const collection = $app.findCollectionByNameOrId('customer');
        let customerRecord;
        try {
          customerRecord = $app.findFirstRecordByData(
            'customer',
            'stripe_customer_id',
            customerId
          );
        } catch (e) {
          customerRecord = new Record(collection);
        }

        customerRecord.set('stripe_customer_id', customerId);
        customerRecord.set('user_id', userRecord.id);

        $app.save(customerRecord);
      }
    } catch (error) {
      return e.json(400, {
        message: 'Unable to create or use customer',
      });
    }

    const items = info.body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return e.json(400, { message: 'No items in cart' });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const successUrl = isProduction
      ? `${process.env.FRONTEND_URL}/checkout/success` // IMPORTANT: Replace with your production success URL
      : 'http://localhost:3000/checkout/success';
    const cancelUrl = isProduction
      ? `${process.env.FRONTEND_URL}/checkout` // IMPORTANT: Replace with your production cancel URL
      : 'http://localhost:3000/checkout';

    let body = `customer=${encodeURIComponent(
      customerId
    )}&billing_address_collection=required&success_url=${encodeURIComponent(
      successUrl
    )}&cancel_url=${encodeURIComponent(cancelUrl)}&mode=payment`;

    items.forEach((item, i) => {
      body += `&line_items[${i}][price_data][currency]=vnd`;
      body += `&line_items[${i}][price_data][product_data][name]=${encodeURIComponent(
        item.name
      )}`;
      body += `&line_items[${i}][price_data][unit_amount]=${item.price}`;
      body += `&line_items[${i}][quantity]=${item.quantity}`;
    });

    try {
      const response = await $http.send({
        url: 'https://api.stripe.com/v1/checkout/sessions',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${apiKey}`,
        },
        body: body,
      });
      return e.json(200, response.json);
    } catch (error) {
      $app.logger().error('Error creating checkout:', error);
      return e.json(400, { message: 'Failed to create checkout' });
    }
  } catch (error) {
    return e.json(400, { message: error });
  }
});

routerAdd('GET', '/create-portal-link', async (e) => {
  const apiKey = process.env.STRIPE_API_KEY || ''; // Provided API key
  const info = e.requestInfo();
  const token = info.headers['authorization'] || '';
  let userRecord;
  try {
    userRecord = await $app.findAuthRecordByToken(token, 'auth');

    const customerRecord = await $app.findFirstRecordByFilter(
      'customer',
      `user_id = "${userRecord.id}"`
    );

    if (!customerRecord) {
      return e.json(404, { message: 'Customer not found' });
    }

    const response = await $http.send({
      url: `https://api.stripe.com/v1/billing_portal/sessions`,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${apiKey}`,
      },
      body: `customer=${encodeURIComponent(
        customerRecord.get('stripe_customer_id')
      )}`,
    });
    return e.json(200, { customer_portal_link: response.json });
  } catch (error) {
    $app
      .logger()
      .error('Error retrieving customer portal link:', error);
    return e.json(400, {
      message: 'Failed to retrieve customer portal link',
    });
  }
});
