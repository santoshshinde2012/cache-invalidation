import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { QueryService } from './query.service';

@Controller('queries')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  async createQuery(
    @Body('userEmail') userEmail: string,
    @Body('moduleName') moduleName: string,
    @Body('queryText') queryText: string,
    @Body('metadata') metadata?: Record<string, unknown>,
  ) {
    return this.queryService.createQuery(
      userEmail,
      moduleName,
      queryText,
      metadata,
    );
  }

  @Get()
  async getQueries(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('moduleName') moduleName?: string,
    @Query('userEmail') userEmail?: string,
    @Query('status') status?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    return this.queryService.getQueries(pageNumber, limitNumber, {
      moduleName,
      userEmail,
      status,
    });
  }
}
