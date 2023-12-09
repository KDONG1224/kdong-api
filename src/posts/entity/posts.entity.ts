// base
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

// entites;
import { BaseTable } from 'src/common/entites/base.entity';
import { TagsTable } from 'src/tags/entity/tags.entity';
import { UsersTable } from 'src/users/entity/users.entity';
import { FileTable } from 'src/common/entites/file.entity';

@Entity()
export class PostsTable extends BaseTable {
  @ApiProperty({ description: '작성자', type: () => UsersTable })
  @ManyToOne(() => UsersTable, (user) => user.articles, { nullable: false })
  author: UsersTable;

  @Column()
  @IsString()
  @ApiProperty({ description: '제목' })
  title: string;

  @Column()
  @IsString()
  @ApiProperty({ description: '내용' })
  content: string;

  @Column({
    default: null
  })
  @IsString()
  @ApiProperty({ description: '카테고리' })
  category?: string;

  @Column({
    default: false
  })
  @IsBoolean()
  @ApiProperty({
    description: '게시글 노출여부',
    default: false,
    required: false
  })
  expose: boolean;

  @OneToMany(() => FileTable, (file) => file.post)
  @ApiProperty({ description: '게시글 썸네일', required: false })
  thumbnails?: FileTable[];

  @OneToMany(() => TagsTable, (tag) => tag.post)
  @ApiProperty({
    description: '게시글 태그들'
  })
  tags?: TagsTable[];

  @Column()
  @IsNumber()
  @ApiProperty({ description: '조회수', default: 0, required: false })
  readCount?: number;

  @Column()
  @ApiProperty({ description: '좋아요', default: 0, required: false })
  likeCount?: number;

  @Column()
  @ApiProperty({ description: '댓글수', default: 0, required: false })
  commentCount?: number;
}
