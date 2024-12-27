import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Query, QuerySchema } from './query.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Query.name, schema: QuerySchema }]),
  ],
  controllers: [QueryController],
  providers: [QueryService],
})
export class QueryModule {}
