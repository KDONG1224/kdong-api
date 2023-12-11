import { PickType } from '@nestjs/mapped-types';
import { CategoriesTable } from '../entity/categories.entity';

export class CreateCategoryDto extends PickType(CategoriesTable, [
  'categoryName',
  'categoryNumber',
  'subCategoryNumber'
]) {}
