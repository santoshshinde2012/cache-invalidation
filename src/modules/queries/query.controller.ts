import {
  Controller,
  Post,
  Body,
  Get,
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
  async getQueries(@Query() queryParams: GetQueriesDto): Promise<{
    data: QueryEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, moduleName, userEmail, status } = queryParams;

    const cacheKey = `queries_page${page}_limit${limit}_moduleName-${moduleName || 'all'}_userEmail-${userEmail || 'all'}_status-${status || 'all'}`;

    const cachedData = await this.redisService.getResult(cacheKey);

    if (cachedData) {
      console.info('X-Cache', 'HIT');

      return JSON.parse(cachedData);
    }

    console.info('X-Cache', 'MISS');

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

    return data;
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
