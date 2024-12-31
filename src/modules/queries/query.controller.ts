import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { QueryService } from './query.service';
import { Query as QueryEntity } from './query.schema';
import { UpdateQueryDto } from './dto/update-query.dto';
import { GetQueriesDto } from './dto/get-queries.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { Response } from 'express';

@Controller('queries')
export class QueryController {
  constructor(
    private readonly queryService: QueryService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  async createQuery(
    @Body('userEmail') userEmail: string,
    @Body('moduleName') moduleName: string,
    @Body('queryText') queryText: string,
    @Body('metadata') metadata?: Record<string, unknown>,
  ) {
    const newQuery = await this.queryService.createQuery(
      userEmail,
      moduleName,
      queryText,
      metadata,
    );

    return newQuery;
  }

  @Get()
  async getQueries(
    @Query() queryParams: GetQueriesDto,
    @Res() res: Response,
  ): Promise<void> {
    const { page = 1, limit = 10, moduleName, userEmail, status } = queryParams;

    const cacheKey = `queries:page:${page}:limit:${limit}:module:${moduleName || 'all'}:user:${userEmail || 'all'}:status:${status || 'all'}`;
    const cachedData = await this.redisService.getResult(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      res.status(200).json(JSON.parse(cachedData));
      return;
    }

    res.setHeader('X-Cache', 'MISS');

    const data = await this.queryService.getQueries(
      Number(page),
      Number(limit),
      {
        moduleName,
        userEmail,
        status,
      },
    );

    await this.redisService.setResult(cacheKey, data);

    res.status(200).json(data);
  }

  @Get(':id')
  async getQuery(@Param('id') id: string): Promise<QueryEntity> {
    return this.queryService.getQueryById(id);
  }

  @Put(':id')
  async updateQuery(
    @Param('id') id: string,
    @Body() updateQueryDto: UpdateQueryDto,
  ): Promise<QueryEntity> {
    return this.queryService.updateQuery(id, updateQueryDto);
  }

  @Delete(':id')
  async deleteQuery(@Param('id') id: string): Promise<void> {
    return this.queryService.deleteQuery(id);
  }
}
