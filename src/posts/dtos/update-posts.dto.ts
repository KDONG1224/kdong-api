// base
import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// dtos
import { CreatePostsDto } from './create-posts.dto';
import { BaseFileUploadDto } from 'src/common/dto/base-file-upload.dto';

// validation
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { Type } from 'class-transformer';

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

  @IsString()
  @IsOptional()
  category?: string;

  @Type(() => Array<Express.Multer.File & BaseFileUploadDto>)
  @IsOptional()
  thumbnails?: Array<Express.Multer.File & BaseFileUploadDto>;

  @IsString()
  @IsOptional()
  hasThumbIds?: string;

  @IsString()
  @IsOptional()
  hasTagIds?: string;
}
