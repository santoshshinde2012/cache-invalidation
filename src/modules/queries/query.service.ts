import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query } from './query.schema';

@Injectable()
export class QueryService {
  constructor(
    @InjectModel(Query.name) private readonly queryModel: Model<Query>,
  ) {}

  async createQuery(
    userEmail: string,
    moduleName: string,
    queryText: string,
    metadata?: Record<string, any>,
  ): Promise<Query> {
    const newQuery = new this.queryModel({
      userEmail,
      moduleName,
      queryText,
      metadata,
    });
    return newQuery.save();
  }

  async getQueries(
    page: number = 1,
    limit: number = 10,
    filter: { moduleName?: string; userEmail?: string; status?: string } = {},
  ): Promise<{ data: Query[]; total: number }> {
    const skip = (page - 1) * limit;

    const queryFilter: Record<string, any> = {};
    if (filter.moduleName) queryFilter.moduleName = filter.moduleName;
    if (filter.userEmail) queryFilter.userEmail = filter.userEmail;
    if (filter.status) queryFilter.status = filter.status;

    const [data, total] = await Promise.all([
      this.queryModel.find(queryFilter).skip(skip).limit(limit).exec(),
      this.queryModel.countDocuments(queryFilter),
    ]);

    return { data, total };
  }
}
