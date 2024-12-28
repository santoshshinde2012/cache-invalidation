import { IsOptional, IsPositive, Min, IsString } from 'class-validator';

export class GetQueriesDto {
  @IsOptional()
  @IsPositive()
  page?: number;

  @IsOptional()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  moduleName?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
