import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Query, QuerySchema } from './query.schema';
import { RedisService } from 'src/common/redis/redis.service';
import { ConfigAppModule } from 'src/config/config.module';

@Module({
  imports: [
    ConfigAppModule,
    MongooseModule.forFeature([{ name: Query.name, schema: QuerySchema }]),
  ],
  controllers: [QueryController],
  providers: [QueryService, RedisService],
})
export class QueryModule {}
