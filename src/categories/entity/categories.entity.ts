// base
import { Column, Entity, OneToMany } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';

// entities
import { BaseTable } from 'src/common/entites/base.entity';
import { PostsTable } from 'src/posts/entity/posts.entity';

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

  @OneToMany(() => PostsTable, (post) => post.category)
  posts?: PostsTable[];
}
