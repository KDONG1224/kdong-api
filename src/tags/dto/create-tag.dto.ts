import { PickType } from '@nestjs/swagger';
import { TagsTable } from '../entity/tags.entity';

export class CreateTagDto extends PickType(TagsTable, ['tag', 'post']) {}
