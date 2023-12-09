import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt: 'DESC' | 'ASC' = 'DESC';

  @IsNumber()
  @IsOptional()
  take: number = 20;
}
