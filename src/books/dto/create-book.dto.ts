import { PickType } from '@nestjs/mapped-types';
import { BooksTable } from '../entity/books.entity';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateBookDto extends PickType(BooksTable, [
  'title',
  'description',
  'width',
  'height'
]) {
  @IsBoolean()
  @IsOptional()
  isCutting?: boolean = false;
}
