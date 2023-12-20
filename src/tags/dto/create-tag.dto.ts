import { PickType } from '@nestjs/swagger';
import { TagsTable } from '../entity/tags.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTagDto extends PickType(TagsTable, ['tag']) {
  @IsString()
  postId: string;

  @IsNumber()
  @IsOptional()
  sequence?: number;
}
