import { IsOptional, IsString } from 'class-validator';

export class UpdateQueryDto {
  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  moduleName?: string;

  @IsOptional()
  @IsString()
  queryText?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
