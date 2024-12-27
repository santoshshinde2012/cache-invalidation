import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongoService implements OnModuleInit, OnApplicationShutdown {
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000;

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    this.setupConnectionListeners();

    await this.connectWithRetry();
  }

  private setupConnectionListeners() {
    this.connection.on('connected', () => {
      console.log('MongoDB connection established successfully');
    });

    this.connection.on('disconnected', () => {
      console.warn('MongoDB connection lost. Attempting to reconnect...');
    });

    this.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
  }

  private async connectWithRetry(retries = 0): Promise<void> {
    try {
      if (this.connection.readyState === 1) {
        return;
      }

      await this.connection.openUri(this.connection.host, {});
    } catch (error) {
      if (retries < this.maxRetries) {
        console.warn(`MongoDB connection failed. Retrying... (${retries + 1})`);
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        await this.connectWithRetry(retries + 1);
      } else {
        console.error(
          'MongoDB connection failed after maximum retries:',
          error,
        );
      }
    }
  }

  async onApplicationShutdown() {
    try {
      if (this.connection.readyState === 1) {
        await this.connection.close();
        console.log('MongoDB connection closed successfully during shutdown');
      }
    } catch (error) {
      console.error('Error occurred while closing MongoDB connection:', error);
    }
  }
}
