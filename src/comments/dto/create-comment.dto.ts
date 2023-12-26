// base
import { PickType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';

// entites
import { CommentsTable } from '../entity/comments.entity';

export class CreateCommentDto extends PickType(CommentsTable, [
  'username',
  'comment',
  'password'
]) {
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
