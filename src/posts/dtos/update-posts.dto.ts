import { IsOptional, IsString } from 'class-validator';
import { CreatePostsDto } from './create-posts.dto';
import { PartialType } from '@nestjs/mapped-types';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class UpdatePostsDto extends PartialType(CreatePostsDto) {
  @IsString({
    message: stringValidationMessage
  })
  @IsOptional()
  title?: string;

  @IsString({
    message: stringValidationMessage
  })
  @IsOptional()
  content?: string;

  @IsString({
    each: true
  })
  @IsOptional()
  tags?: string;
}
