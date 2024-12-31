<h1 align="center"><a href="https://blog.santoshshinde.com/skeleton-for-node-js-apps-written-in-typescript-444fa1695b30" target=”_blank”>Cache Invalidation</a></h1>
<p align="center">
  <a href="https://www.buymeacoffee.com/santoshshin" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/default-black.png" alt="Buy Me A Coffee" height="28" width="100">
    </a>
</p>

## Description

- [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.
- Designing a Robust Asynchronous Cache Invalidation Architecture with NestJS, Kafka, and Redis

## Project setup

- Start the infra

```
openssl rand -base64 756 > ./init/key
chmod 400 ./init/key
chmod +x ./init/init-replica.sh
docker-compose -f infra/docker-compose.yml up -d
```

- Debzium Connector Config

```
curl --location 'localhost:8083/connectors' \
--header 'Content-Type: application/json' \
--data '{
    "name": "mongo-connector",
    "config": {
      "connector.class": "io.debezium.connector.mongodb.MongoDbConnector",
      
      // MongoDB Connection Details
      "mongodb.hosts": "rs0/mongo:27017", // Replace with your MongoDB hosts
      "mongodb.name": "dbserver1", // Logical name for the MongoDB server
      
      // Authentication
      "mongodb.user": "root",
      "mongodb.password": "rootpassword",
      "mongodb.authsource": "admin",
      
      // Capture Mode - This setting ensures you capture both before and after states for updates
      "capture.mode": "change_streams_update_full_with_pre_image",
      
      // Collections to Monitor
      "database.include.list": "database", // Adjust according to your needs
      "collection.include.list": "database.queries", // Adjust according to your needs
      
      // Number of Tasks
      "tasks.max": "3", // Adjust based on your resources and requirements
      
      // Kafka Topic Naming
      "topic.prefix": "dbserver1", // Prefix for Kafka topics
      
      // Schema and Event Handling
      "output.schema": "true",
      "key.converter": "org.apache.kafka.connect.json.JsonConverter",
      "key.converter.schemas.enable": "false",
      "value.converter": "org.apache.kafka.connect.json.JsonConverter",
      "value.converter.schemas.enable": "false",
      
      // Performance Tuning
      "snapshot.mode": "initial", // Perform an initial snapshot when starting up
      "snapshot.max.threads": "4", // Number of threads for snapshotting
      
      // Transaction Metadata
      "provide.transaction.metadata": "true",
      
      // Error Handling
      "errors.retry.timeout": "0", // No retry on failures, for production you might want to adjust this
      "errors.tolerance": "none", // Tolerance for errors
      
      // Heartbeat for Monitoring
      "heartbeat.interval.ms": "30000", // Every 30 seconds
      
      // Miscellaneous
      "max.queue.size": "8192", // Maximum number of records that can be buffered in memory
      "max.batch.size": "2048",
      "poll.interval.ms": "1000"
  }
}
'

// Response

{
    "name": "mongodb-connector",
    "config": {
        "connector.class": "io.debezium.connector.mongodb.MongoDbConnector",
        "mongodb.hosts": "rs0/mongo:27017",
        "mongodb.name": "dbserver1",
        "mongodb.user": "root",
        "mongodb.password": "rootpassword",
        "mongodb.authsource": "admin",
        "capture.mode": "change_streams_update_full_with_pre_image",
        "database.include.list": "database",
        "collection.include.list": "database.queries",
        "tasks.max": "3",
        "topic.prefix": "dbserver1",
        "output.schema": "true",
        "key.converter": "org.apache.kafka.connect.json.JsonConverter",
        "key.converter.schemas.enable": "false",
        "value.converter": "org.apache.kafka.connect.json.JsonConverter",
        "value.converter.schemas.enable": "false",
        "snapshot.mode": "initial",
        "snapshot.max.threads": "4",
        "provide.transaction.metadata": "true",
        "errors.retry.timeout": "0",
        "errors.tolerance": "none",
        "heartbeat.interval.ms": "30000",
        "max.queue.size": "8192",
        "max.batch.size": "2048",
        "poll.interval.ms": "1000",
        "name": "mongodb-connector1"
    },
    "tasks": [],
    "type": "source"
}
```

- Debzium Connector Config Status

```
// Request

curl --location 'localhost:8083/connectors/mongo-connector/status' \
--data ''

// Response

{
    "name": "mongodb-connector",
    "connector": {
        "state": "RUNNING",
        "worker_id": "172.18.0.7:8083"
    },
    "tasks": [
        {
            "id": 0,
            "state": "RUNNING",
            "worker_id": "172.18.0.7:8083"
        }
    ],
    "type": "source"
}
```

- Create `.env` file

```
KAFKA_CLIENT_ID=my-kafka-client
KAFKA_BROKERS=localhost:29092
KAFKA_TOPIC=dbserver1.database.queries

REDIS_HOST=localhost
REDIS_PORT=6379
MONGODB_URI=mongodb://root:rootpassword@localhost:27017/database?authSource=admin&replicaSet=rs0
```

- Install the npm modules

```bash
$ npm install
```

## Guide

```
npm install --save kafkajs redis
npm install --save @nestjs/config
```

## Compile and run the project

```bash
$ docker compose up
```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- [Debezium connector for MongoDB](https://docs.redhat.com/en/documentation/red_hat_build_of_debezium/2.3.4/html/debezium_user_guide/debezium-connector-for-mongodb#debezium-mongodb-triggering-an-incremental-snapshot)

## Stay in touch

<div id="badges">
  <a href="https://twitter.com/shindesan2012">
    <img src="https://img.shields.io/badge/shindesan2012-black?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter Badge"/>
  </a>
  <a href="https://www.linkedin.com/in/shindesantosh/">
    <img src="https://img.shields.io/badge/shindesantosh-blue?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Badge"/>
  </a>
   <a href="https://blog.santoshshinde.com/">
    <img src="https://img.shields.io/badge/Blog-black?style=for-the-badge&logo=medium&logoColor=white" alt="Medium Badge"/>
  </a>
</div>
