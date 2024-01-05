import { PickType } from '@nestjs/mapped-types';
import { BooksTable } from '../entity/books.entity';

export class CreateBookDto extends PickType(BooksTable, [
  'title',
  'description',
  'width',
  'height'
]) {}
