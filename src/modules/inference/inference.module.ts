import { Module } from '@nestjs/common';
import { InferenceService } from './inference.service';
import { InferenceController } from './inference.controller';
import { KafkaConsumerService } from 'src/kafka/kafka-consumer.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';
import { RedisService } from 'src/redis/redis.service';
import { ConfigAppModule } from 'src/config/config.module';

@Module({
  imports: [ConfigAppModule],
  controllers: [InferenceController],
  providers: [
    RedisService,
    KafkaProducerService,
    KafkaConsumerService,
    InferenceService,
  ],
})
export class InferenceModule {}
