// base
import { IsBoolean, IsString, Length } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';

// entites
import { BaseTable } from 'src/common/entites/base.entity';
import { PostsTable } from 'src/posts/entity/posts.entity';

// validation-message
import { legthValidationMessage } from 'src/common/validation-message/legth-validation.message';

@Entity()
export class CommentsTable extends BaseTable {
  @ManyToOne(() => PostsTable, (post) => post.comments)
  post: PostsTable;

  @Column()
  @IsString()
  username: string;

  @Column()
  @IsString()
  comment: string;

  @Column()
  @IsString()
  @Length(4, 8, {
    message: legthValidationMessage
  })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    default: false
  })
  @IsBoolean()
  isPrivate?: boolean;
}
