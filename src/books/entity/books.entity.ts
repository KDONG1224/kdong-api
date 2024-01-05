// base
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// entities
import { BaseTable } from 'src/common/entites/base.entity';
import { UsersTable } from 'src/users/entity/users.entity';

// consts
import { ViewerTypeEnum } from '../consts/viewerType.const';
import { FileTable } from 'src/common/entites/file.entity';

@Entity()
export class BooksTable extends BaseTable {
  @Column()
  @IsString()
  @ApiProperty({ description: '책 제목' })
  title: string;

  @Column()
  @IsString()
  @ApiProperty({ description: '책 소개' })
  description: string;

  @Column()
  @IsNumber()
  @ApiProperty({ description: '책 장수' })
  pageLength: number;

  @Column({
    enum: Object.values(ViewerTypeEnum),
    default: ViewerTypeEnum.vertical
  })
  @IsString()
  @ApiProperty({ description: '책 뷰어 타입' })
  viewerType: string;

  @Column()
  @IsNumber()
  width: number;

  @Column()
  @IsNumber()
  height: number;

  @Column({
    default: true
  })
  @IsBoolean()
  @ApiProperty({ description: '책 노출 여부' })
  expose: boolean;

  @ApiProperty({ description: '책 저자' })
  @ManyToOne(() => UsersTable, (user) => user.books)
  author: UsersTable;

  @ApiProperty({ description: '책 내용' })
  @OneToMany(() => FileTable, (file) => file.book)
  pages?: FileTable[];
}
