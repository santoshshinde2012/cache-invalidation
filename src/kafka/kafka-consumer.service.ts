import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { RedisService } from '../redis/redis.service';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private inferenceConsumer: Consumer;
  private databaseConsumer: Consumer;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly redisService: RedisService,
  ) {
    this.kafka = new Kafka({
      clientId: this.appConfigService.kafkaClientId,
      brokers: this.appConfigService.kafkaBrokers,
    });
    this.inferenceConsumer = this.kafka.consumer({
      groupId: this.appConfigService.kafkaConsumerGroupIds[0],
    });
    this.databaseConsumer = this.kafka.consumer({
      groupId: this.appConfigService.kafkaConsumerGroupIds[1],
    });
  }

  async onModuleInit() {
    // Initialize both consumers
    await this.initializeConsumer(
      this.inferenceConsumer,
      'inference-group',
      this.handleInferenceMessage,
    );
    await this.initializeConsumer(
      this.databaseConsumer,
      'database-group',
      this.handleDatabaseChangeMessage,
    );
  }

  // Helper function to initialize each consumer
  private async initializeConsumer(
    consumer: Consumer,
    groupId: string,
    messageHandler: (
      payload: any,
      correlationId: string,
      groupId: string,
    ) => Promise<void>,
  ) {
    // Connect consumer
    await consumer.connect();
    console.log(`Consumer group ${groupId} connected`);

    // Subscribe to the topic, potentially using filtering for different types of messages
    await consumer.subscribe({
      topic: this.appConfigService.kafkaTopic,
      fromBeginning: true,
    });

    // Define how each message will be processed
    consumer.run({
      eachMessage: async ({ message }) => {
        const correlationId = message.key.toString();
        const payload = JSON.parse(message.value.toString());

        console.log(
          `Consumer group ${groupId} received message for correlation ID: ${correlationId}`,
          payload,
        );

        // Handle the message using the appropriate handler
        await messageHandler(payload, correlationId, groupId);
      },
    });
  }

  private async handleInferenceMessage(
    payload: any,
    correlationId: string,
    groupId: string,
  ) {
    if (payload.type !== 'inference') {
      return; // Ignore non-inference messages
    }

    console.log(
      `Inference Consumer group ${groupId} - Processing inference request for:`,
      payload,
    );

    // Simulate inference (you can modify this based on your actual logic)
    const result = this.simulateInference(payload);

    // Store result in Redis
    await this.redisService.setResult(correlationId, result);
    console.log(
      `Inference Consumer group ${groupId} - Result stored in Redis for correlation ID: ${correlationId}`,
    );
  }

  private async handleDatabaseChangeMessage(
    payload: any,
    correlationId: string,
    groupId: string,
  ) {
    if (payload.type !== 'db-change') {
      return; // Ignore non-database change messages
    }

    console.log(
      `Database Consumer group ${groupId} - Processing database change event for:`,
      payload,
    );

    // Process the MongoDB change (insert, update, delete)
    await this.handleMongoChangeEvent(payload, correlationId, groupId);
  }

  private async handleMongoChangeEvent(
    payload: any,
    correlationId: string,
    groupId: string,
  ) {
    switch (payload.operationType) {
      case 'insert':
        await this.handleDbOperation(payload, correlationId, groupId);
        break;
      case 'update':
        await this.handleDbOperation(payload, correlationId, groupId);
        break;
      case 'delete':
        await this.handleDbOperation(payload, correlationId, groupId);
        break;
      default:
        console.log(
          `Consumer group ${groupId} unknown operation: ${payload.operationType}`,
        );
    }
  }
  private async handleDbOperation(
    payload: any,
    correlationId: string,
    groupId: string,
  ) {
    const insertedDocument = payload.fullDocument;
    console.log(`Consumer group ${groupId} Insert event:`, insertedDocument);

    const result = this.simulateInference(insertedDocument);
    await this.redisService.setResult(correlationId, result);
    console.log(
      `Consumer group ${groupId} Result stored in Redis for correlation ID: ${correlationId}`,
    );
  }

  private simulateInference(data: any): Record<string, any> {
    return {
      status: 'COMPLETED',
      data: `Processed data for input: ${data.input}`,
      timestamp: new Date().toISOString(),
    };
  }

  async onModuleDestroy() {
    await this.inferenceConsumer.disconnect();
    console.log('Kafka Consumer disconnected');
  }
}
