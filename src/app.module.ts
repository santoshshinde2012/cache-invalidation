import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './common/kafka/kafka-consumer.service';
import { ConfigAppModule } from './config/config.module';
import { MongoModule } from './modules/mongo/mongo.module';
import { QueryModule } from './modules/queries/query.module';
import { RedisService } from './common/redis/redis.service';

@Module({
  imports: [ConfigAppModule, MongoModule, QueryModule],
  controllers: [],
  providers: [RedisService, KafkaConsumerService],
})
export class AppModule {}
