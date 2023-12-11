import { FindManyOptions } from 'typeorm';
import { CategoriesTable } from '../entity/categories.entity';
import { DeleteEnum } from './deletes.const';

export const DEFAULT_CATEGORY_FIND_OPTIONS: FindManyOptions<CategoriesTable> = {
  where: {
    deleteStatus: DeleteEnum.N
  }
};
