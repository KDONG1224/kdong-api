// base
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsString } from 'class-validator';

// entites
import { BaseTable } from 'src/common/entites/base.entity';
import { PostsTable } from 'src/posts/entity/posts.entity';

@Entity()
export class TagsTable extends BaseTable {
  @ManyToOne(() => PostsTable, (post) => post.tags)
  @ApiProperty({ description: '태그에 연결된 게시글' })
  post: PostsTable;

  @Column()
  @IsString()
  @ApiProperty({ description: '태그에 연결된 게시글' })
  tag: string;
}
