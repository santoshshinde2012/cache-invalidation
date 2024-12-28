import { Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service';
import { KafkaConsumerService } from './kafka/kafka-consumer.service';
import { ConfigAppModule } from './config/config.module';
import { MongoModule } from './mongo/mongo.module';
import { QueryModule } from './modules/queries/query.module';

@Module({
  imports: [ConfigAppModule, MongoModule, QueryModule],
  controllers: [],
  providers: [RedisService, KafkaConsumerService],
})
export class AppModule {}
