/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = new Collection({
      id: 'pbc_1234567890',
      name: 'customer',
      type: 'base',
      system: false,
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text',
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'text4567890123',
          max: 0,
          min: 0,
          name: 'stripe_customer_id',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: true,
          system: false,
          type: 'text',
        },
        {
          cascadeDelete: true,
          collectionId: '_pb_users_auth_',
          hidden: false,
          id: 'relation1234567890',
          maxSelect: 1,
          minSelect: 0,
          name: 'user_id',
          presentable: false,
          required: true,
          system: false,
          type: 'relation',
        },
        {
          hidden: false,
          id: 'autodate2990389176',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate',
        },
        {
          hidden: false,
          id: 'autodate3332085495',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate',
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_stripe_customer_id ON customer (stripe_customer_id)',
        'CREATE UNIQUE INDEX idx_user_id ON customer (user_id)',
      ],
      listRule:
        '@request.auth.id != "" && @request.auth.id = user_id.id',
      viewRule:
        '@request.auth.id != "" && @request.auth.id = user_id.id',
      createRule: null,
      updateRule: null,
      deleteRule: null,
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('pbc_1234567890');

    return app.delete(collection);
  }
);
