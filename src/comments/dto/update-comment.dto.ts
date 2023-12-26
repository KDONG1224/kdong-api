// base
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';

// entites
import { CommentsTable } from '../entity/comments.entity';

export class UpdateCommentDto extends PartialType(CommentsTable) {
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
