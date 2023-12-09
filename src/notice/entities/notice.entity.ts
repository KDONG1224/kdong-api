import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { BaseTable } from 'src/common/entites/base.entity';
import { UsersTable } from 'src/users/entity/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class NoticeTable extends BaseTable {
  @ApiProperty({ description: '작성자' })
  @ManyToOne(() => UsersTable, (user) => user.username, { nullable: false })
  authorName: string;

  @Column()
  @IsString()
  @ApiProperty({ description: '제목' })
  title: string;

  @Column()
  @IsString()
  @ApiProperty({ description: '내용' })
  content: string;

  @Column()
  @IsNumber()
  @ApiProperty({ description: '조회수', default: 0, required: false })
  readCount?: number;
}
