import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private appConfig: AppConfigService) {
    this.client = new Redis({
      host: this.appConfig.redisHost,
      port: this.appConfig.redisPort,
    });
  }

  async getResult(key: string): Promise<string> {
    return this.client.get(key);
  }

  async setResult<T>(key: string, result: T): Promise<void> {
    await this.client.set(key, JSON.stringify(result));
  }

  async deleteKeysByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length) {
      await this.client.del(keys);
    }
  }

  async clear(): Promise<void> {
    await this.client.flushall();
  }
}
