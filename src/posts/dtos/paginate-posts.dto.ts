import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class PaginatePostsDto extends BasePaginationDto {
  @IsString()
  @IsOptional()
  'where__title'?: string;

  @IsBoolean()
  @IsOptional()
  'where__expose'?: boolean;

  @IsString()
  @IsOptional()
  'where__fromDate'?: string;

  @IsString()
  @IsOptional()
  'where__toDate'?: string;

  @IsString()
  @IsOptional()
  'where__category'?: string;

  @IsString()
  @IsOptional()
  'where__category__id'?: string;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  'order__readCount'?: 'DESC' | 'ASC' = 'DESC';
}
