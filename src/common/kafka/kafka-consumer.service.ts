import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { RedisService } from '../redis/redis.service';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private databaseConsumer: Consumer;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly redisService: RedisService,
  ) {
    const kafka = new Kafka({
      clientId: this.appConfigService.kafkaClientId,
      brokers: this.appConfigService.kafkaBrokers,
    });
    this.databaseConsumer = kafka.consumer({ groupId: 'change-tracker-group' });
  }

  async onModuleInit() {
    try {
      await this.initializeConsumer(
        this.databaseConsumer,
        this.handleDatabaseChangeMessage,
      );
    } catch (error) {
      console.error('Error during consumer initialization:', error);
    }
  }

  private async initializeConsumer(
    consumer: Consumer,
    messageHandler: (messagePayload: EachMessagePayload) => Promise<void>,
  ) {
    try {
      await consumer.connect();

      await consumer.subscribe({
        topic: this.appConfigService.kafkaTopic,
        fromBeginning: true,
      });

      await consumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          try {
            await messageHandler.call(this, messagePayload);
          } catch (error) {
            console.error(
              `Error processing message from topic ${messagePayload.topic}:`,
              error.stack,
            );
          }
        },
      });
    } catch (error) {
      console.error('Error initializing consumer:', error.stack);
    }
  }

  private async handleDatabaseChangeMessage({ message }: EachMessagePayload) {
    if (!message.value) {
      console.warn('Received a message with no value. Skipping...');
      return;
    }

    try {
      const { op, after, before } = JSON.parse(message.value.toString());
      switch (op) {
        case 'c':
        case 'u':
        case 'd':
          await this.handleCacheInvalidation(op, after, before);
          break;
        default:
          console.warn(`Unhandled operation: ${op}`);
          break;
      }
    } catch (error) {
      console.error('Error handling database change message:', error.stack);
    }
  }
  async handleCacheInvalidation<T>(op: string, after: T, before: T) {
    console.log('Cache Invalidation', op, after, before);
  }

  async onModuleDestroy() {
    try {
      await this.databaseConsumer.disconnect();
      console.log('Kafka consumer disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Kafka consumer:', error.stack);
    }
  }
}
