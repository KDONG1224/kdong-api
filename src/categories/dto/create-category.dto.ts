import { PickType } from '@nestjs/mapped-types';
import { CategoriesTable } from '../entity/categories.entity';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto extends PickType(CategoriesTable, [
  'categoryName',
  'categoryNumber',
  'subCategoryNumber'
]) {
  @IsString()
  @IsOptional()
  categoryEngName?: string;
}
