// base
import { Column, Entity } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';

// entities
import { BaseTable } from 'src/common/entites/base.entity';

// consts
import { DeleteEnum } from '../consts/deletes.const';

@Entity()
export class CategoriesTable extends BaseTable {
  @Column()
  @IsString()
  categoryName: string;

  @Column()
  @IsNumber()
  categoryNumber: number;

  @Column()
  @IsNumber()
  subCategoryNumber: number;

  @Column({
    enum: Object.values(DeleteEnum),
    default: DeleteEnum.N
  })
  deleteStatus?: DeleteEnum;

  @Column()
  @IsString()
  createdByUserId: string;
}
