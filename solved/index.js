// import service broker and web server
const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

// import db service and adapter to user sequelize ORM
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const { DataTypes } = require("sequelize");


// Create the broker for node with id "node-1" and use NATS as transporter
const brokerNode1 = new ServiceBroker({
  nodeID: "node-1",
  transporter: "NATS"
});

// Create the "gateway" service in "node-1"
brokerNode1.createService({
  name: "gateway",
  // properties present in the "HTTPServer" service are mixed in to our "gateway" service
  mixins: [HTTPServer],
  settings: {
    routes: [
      {
        // Add /api to base URL
        path: "/api",
        aliases: {
          // /api/products routes
          "GET /products": "products.listProducts",
          "GET /products/:id": "products.findProduct",
          "POST /products": "products.createProduct",
          "PUT /products/:id": "products.updateProduct",
          "DELETE /products/:id": "products.deleteProduct",
          "POST /products/seed": "products.seedProducts"
        }
      }
    ]
  }
});

// Create the broker for node with id "node-2" and use NATS as transporter
const brokerNode2 = new ServiceBroker({
  nodeID: "node-2",
  transporter: "NATS"
});

// Create the "db" service in "node-2"
brokerNode2.createService({
  name: "db",
  // properties present in the "DbService" are mixed in to our "db" service
  mixins: [DbService],
  // add in adapter for Sequelize and provide: db name, user name, password, and options object
  adapter: new SqlAdapter('shop_db', '<insert username>', '<insert password>', {
    host: 'localhost',
    dialect: 'mysql',
    dialectOptions: {
      decimalNumbers: true,
    },
  }),
  // define product model
  model: {
    name: "product",
    define: {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: DataTypes.STRING,
      price: DataTypes.DECIMAL(10,2),
      quantity: DataTypes.INTEGER
    }
  }
})

// Create the broker for node with id "node-3" and use NATS as transporter
const brokerNode3 = new ServiceBroker({
  nodeID:"node-3",
  transporter: "NATS"
});

// Create the "products" service in "node-3"
brokerNode3.createService({
  name:"products",
  // Define actions, which are public methods of the service that can be called externally
  actions: {
    // Called for our GET /api/products route
    async listProducts(ctx) {
      const products = await brokerNode2.call("db.find");
      return products;
    },
    // Called for our GET /api/products/:id route
    async findProduct(ctx) {
      const product = await brokerNode2.call("db.get", { id: ctx.params.id });
      return product;
    },
    // Called for our POST /api/products route
    async createProduct(ctx) {
      const product = await brokerNode2.call("db.create", { name: ctx.params.name, price: ctx.params.price, quantity: ctx.params.quantity });
      return [ { message: "Product created!" }, product ];
    },
    // Called for our PUT /api/products/:id route
    async updateProduct(ctx) {
      const product = await brokerNode2.call("db.update", { id: ctx.params.id, name: ctx.params.name, price: ctx.params.price, quantity: ctx.params.quantity });
      return [ { message: "Product updated!" }, product ];
    },
    // Called for our DELETE /api/products/:id route
    async deleteProduct(ctx) {
      const product = await brokerNode2.call("db.remove", { id: ctx.params.id });
      return [ { message: "Product deleted!" }, product ];
    },
    // Called for our POST /api/products/seed route
    async seedProducts(ctx) {
      await brokerNode2.call("db.create", { name: "baseball", price: 5.99, quantity: 100 });
      await brokerNode2.call("db.create", { name: "magazine", price: 3.99, quantity: 123 });
      await brokerNode2.call("db.create", { name: "comb", price: 2.25, quantity: 1560 });
      await brokerNode2.call("db.create", { name: "hat", price: 10.99, quantity: 164 });
      return { message: "Products seeded!" };
    }
  },
  // Service will not start until "db" service is started
  dependencies: [
    "db"
  ]
});

// Start all brokers
Promise.all([brokerNode1.start(), brokerNode2.start(), brokerNode3.start()]);
