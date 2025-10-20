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
          // Note: You need to add a 'stripe_product_id' text field to your 'products' collection.
          record = $app.findFirstRecordByData(
            'products',
            'stripe_product_id',
            product.id
          );
        } catch (e) {
          record = new Record(collection);
          record.set('stripe_product_id', product.id);
        }

        record.set('name', product.name);
        record.set('description', product.description || '');
        // The 'products' collection has 'price' and 'stock' fields.
        // The Stripe webhook for products doesn't contain price and stock info in a simple format.
        // Prices are managed as separate objects in Stripe.
        // You might need to handle 'price.created' and 'price.updated' events
        // to update the price in your 'products' collection. I have removed the price handler for now.

        $app.save(record);
      } catch (err) {
        $app.logger().error('Error processing product:', err);
        throw new BadRequestError(
          'Failed to process product: ' + err.message
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

    const lineParams = [
      {
        price: info.body.price.id,
        quantity: info.body.quantity || 1, // Default to 1 if quantity is not provided
      },
    ];

    const customerUpdateParams = {
      address: 'auto',
    };

    let sessionParams = {
      customer: customerId,
      billing_address_collection: 'required',
      customer_update: customerUpdateParams,
      allow_promotion_codes: true,
      success_url: 'https://your-success-url.com', // Replace with actual success URL
      cancel_url: 'https://your-cancel-url.com', // Replace with actual cancel URL
      line_items: lineParams.map((item) => ({
        price: item.price,
        quantity: item.quantity,
      })),
    };

    if (info.body.price.type === 'recurring') {
      sessionParams.mode = 'subscription';
    } else if (info.body.price.type === 'one_time') {
      sessionParams.mode = 'payment';
    } else {
      throw new Error('Invalid price type');
    }

    try {
      const response = await $http.send({
        url: 'https://api.stripe.com/v1/checkout/sessions',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${apiKey}`,
        },
        body: Object.entries(sessionParams)
          .flatMap(([key, value]) => {
            if (Array.isArray(value)) {
              return value
                .map((v, i) =>
                  Object.entries(v)
                    .map(
                      ([subKey, subValue]) =>
                        `${encodeURIComponent(
                          `${key}[${i}][${subKey}]`
                        )}=${encodeURIComponent(subValue)}`
                    )
                    .join('&')
                )
                .join('&');
            } else if (typeof value === 'object' && value !== null) {
              return Object.entries(value)
                .map(
                  ([subKey, subValue]) =>
                    `${encodeURIComponent(
                      `${key}[${subKey}]`
                    )}=${encodeURIComponent(subValue)}`
                )
                .join('&');
            }
            return `${encodeURIComponent(key)}=${encodeURIComponent(
              value
            )}`;
          })
          .join('&'),
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
