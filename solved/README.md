# Moleculer CRUD App

## Instructions to Run App

In order to run this completed app, you will need the following to be configured and running:

### Docker Desktop or the Docker Daemon

* This is used to run and configure a NATS server.

* Optionally you can also use it to configure MySQL server if you do not have a local installation.

### NATS Server

* Run the following command in the terminal:

  ```bash
  docker run -d -p 4222:4222 -p 8222:8222 -p 6222:6222 --name nats-server -ti nats:latest
  ```

* Make sure to keep this container running as the nodes must connect to it for communication.

### MySQL Server

#### Instructions for existing MySQL installation

* The db service in the app connects to MySQL via a Sequelize connection.

* Within `index.js`, make sure to replace the template `<insert username>` and `<insert password>` with your MySQL username and password for your MySQL instance running on the default port `3306`.

* You must also create a database in your MySQL instance called `shop_db`. To do so, follow these steps:

  * Log into the mysql CLI by entering in the terminal:

    ```bash
    mysql -u <insert username> -p
    ```

  * You will most likely want to use `root` as your username.

  * Enter password when prompted after issuing this command.

  * Type the following statement to create the database named `shop_db`:

    ```sql
    CREATE DATABASE shop_db;
    ```

  * To verify the creation, run the following statement:

    ```sql
    SHOW DATABASES;
    ```

#### Instructions Setting up MySQL in a Docker Container

* If you do not have an installation of MySQL Server, follow these steps (**If you have already configured MySQL above, skip these steps!**):

  * Enter the following command in the terminal:

    ```bash
    docker run --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=mysql -d mysql
    ```

  * Running the previous command has set the `root` user password to `mysql`.

  * Run the following command to open the mysql shell in the docker container:

    ```bash
    docker run -it --link mysql:mysql --rm mysql sh -c 'exec mysql -h"$MYSQL_PORT_3306_TCP_ADDR" -P"$MYSQL_PORT_3306_TCP_PORT" -uroot -p"$MYSQL_ENV_MYSQL_ROOT_PASSWORD"'
    ```

  * Type the following statement to create the database named `shop_db`:

    ```sql
    CREATE DATABASE shop_db;
    ```

  * To verify the creation, run the following statement:

    ```sql
    SHOW DATABASES;
    ```

  * Within `index.js`, make sure to replace the template `<insert username>` and `<insert password>` with `root` and `mysql` respectively.

### Node.js

* Use the following commands to run the app after the configuration above is complete:

  ```bash
  npm i
  node index.js
  ```

### Insomnia, Postman, or Alternative

* Once the app is running, you can test the routes using Insomnia, Postman, or some other tool.

* The Gateway Service should listen by default at port `3000` and is available at `http://localhost:3000`.

* The available routes are:

  ```txt
  GET /api/products
  GET /api/products/:id
  POST /api/products
  PUT /api/products/:id
  DELETE /api/products/:id
  POST /api/products/seed
  ```

The product schema looks like the following:

  ```js
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
  ```

### Stop and Remove Containers and Images

When finished with the app, use the following steps to clean up Docker resources.

**If you used a local installation of MySQL, you can omit the `mysql` argument in all commands below**

* To stop the containers used by this app, run the following command:

  ```bash
  docker stop mysql nats-server
  ```

* To remove the containers created, run the following command:

  ```bash
  docker rm mysql nats-server
  ```

* To remove the images, run the following command:

  ```bash
  docker rmi mysql nats
  ```
