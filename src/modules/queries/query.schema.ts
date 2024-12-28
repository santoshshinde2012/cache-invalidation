import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Query extends Document {
  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  moduleName: string;

  @Prop({ required: true })
  queryText: string;

  @Prop({ default: null })
  status?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;
}

export const QuerySchema = SchemaFactory.createForClass(Query);
