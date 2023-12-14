// base
import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// entities
import { PostsTable } from '../entity/posts.entity';

// dtos
import { BaseFileUploadDto } from 'src/common/dto/base-file-upload.dto';

export class CreatePostsDto extends PickType(PostsTable, ['title', 'content']) {
  @IsString({
    each: true
  })
  @IsOptional()
  tags?: string;

  @Type(() => Array<Express.Multer.File & BaseFileUploadDto>)
  @IsOptional()
  thumbnails?: Array<Express.Multer.File & BaseFileUploadDto>;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  mainColor?: string;

  @IsString()
  @IsOptional()
  subColor?: string;
}
