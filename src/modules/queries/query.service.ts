import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query } from './query.schema';
import { UpdateQueryDto } from './dto/update-query.dto';

@Injectable()
export class QueryService {
  constructor(
    @InjectModel(Query.name) private readonly queryModel: Model<Query>,
  ) {}

  async createQuery(
    userEmail: string,
    moduleName: string,
    queryText: string,
    metadata?: Record<string, unknown>,
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
    filters: { moduleName?: string; userEmail?: string; status?: string } = {},
  ): Promise<{ data: Query[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (filters.moduleName) query.moduleName = filters.moduleName;
    if (filters.userEmail) query.userEmail = filters.userEmail;
    if (filters.status) query.status = filters.status;

    const [data, total] = await Promise.all([
      this.queryModel.find(query).skip(skip).limit(limit).exec(),
      this.queryModel.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit };
  }

  async getQueryById(id: string): Promise<Query> {
    const query = await this.queryModel.findById(id).exec();
    if (!query) {
      throw new NotFoundException(`Query with ID ${id} not found`);
    }
    return query;
  }

  async updateQuery(
    id: string,
    updateQueryDto: UpdateQueryDto,
  ): Promise<Query> {
    const updatedQuery = await this.queryModel
      .findByIdAndUpdate(id, updateQueryDto, { new: true })
      .exec();
    if (!updatedQuery) {
      throw new NotFoundException(`Query with ID ${id} not found`);
    }
    return updatedQuery;
  }

  async deleteQuery(id: string): Promise<void> {
    const query = await this.queryModel.findByIdAndDelete(id).exec();
    if (!query) {
      throw new NotFoundException(`Query with ID ${id} not found`);
    }
  }
}
