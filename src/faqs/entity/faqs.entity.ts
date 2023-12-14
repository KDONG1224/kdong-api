import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseTable } from 'src/common/entites/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class FaqsTable extends BaseTable {
  @Column()
  @IsString()
  @ApiProperty({ description: '질문' })
  question: string;

  @Column()
  @IsString()
  @ApiProperty({ description: '답변' })
  answer: string;

  @Column()
  @IsString()
  @ApiProperty({ description: '질문 타입' })
  faqType: string;

  @Column()
  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: '순서' })
  sequence?: number;

  @Column({ default: false })
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '노출 여부' })
  expose?: boolean;
}
