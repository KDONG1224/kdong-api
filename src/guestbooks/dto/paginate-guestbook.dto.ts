import { IsNumber, IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class PaginateGuestbookDto extends BasePaginationDto {
  @IsNumber()
  @IsOptional()
  take: number = 6;
}
