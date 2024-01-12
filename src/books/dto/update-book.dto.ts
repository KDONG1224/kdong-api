import { PartialType } from '@nestjs/mapped-types';
import { BooksTable } from '../entity/books.entity';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBookDto extends PartialType(BooksTable) {
  @IsBoolean()
  @IsOptional()
  isCutting?: boolean = false;

  @IsString()
  @IsOptional()
  thumbnail?: string;
}
