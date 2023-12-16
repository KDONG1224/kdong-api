import { PickType } from '@nestjs/swagger';
import { TagsTable } from '../entity/tags.entity';
import { IsString } from 'class-validator';

export class CreateTagDto extends PickType(TagsTable, ['tag']) {
  @IsString()
  postId: string;
}
