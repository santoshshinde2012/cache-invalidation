import { Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service';
import { KafkaProducerService } from './kafka/kafka-producer.service';
import { KafkaConsumerService } from './kafka/kafka-consumer.service';
import { ConfigAppModule } from './config/config.module';
import { MongoModule } from './mongo/mongo.module';
import { InferenceModule } from './modules/inference/inference.module';
import { QueryModule } from './modules/queries/query.module';

@Module({
  imports: [ConfigAppModule, MongoModule, InferenceModule, QueryModule],
  controllers: [],
  providers: [RedisService, KafkaProducerService, KafkaConsumerService],
})
export class AppModule {}
