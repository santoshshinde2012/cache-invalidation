// src/redis/redis.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private appConfig: AppConfigService) {
    this.client = new Redis({
      host: this.appConfig.redisHost,
      port: this.appConfig.redisPort,
    });
  }

  async getResult(correlationId: string): Promise<string> {
    return this.client.get(correlationId);
  }

  async setResult<T>(correlationId: string, result: T): Promise<void> {
    await this.client.set(correlationId, JSON.stringify(result));
  }
}
