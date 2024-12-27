import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../config/config.service';
import { MongoService } from './mongo.service';
import { ConfigAppModule } from 'src/config/config.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigAppModule],
      useFactory: async (appConfigService: AppConfigService) => ({
        uri: appConfigService.mongoUri,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [MongoService],
  exports: [MongoService],
})
export class MongoModule {}
