import { PickType } from '@nestjs/mapped-types';
import { PostsTable } from '../entity/posts.entity';
import { IsOptional, IsString } from 'class-validator';
import { BaseFileUploadDto } from 'src/common/dto/base-file-upload.dto';
import { Type } from 'class-transformer';

export class CreatePostsDto extends PickType(PostsTable, ['title', 'content']) {
  @IsString({
    each: true
  })
  @IsOptional()
  tags?: string;

  @Type(() => Array<Express.Multer.File & BaseFileUploadDto>)
  @IsOptional()
  thumbnails?: Array<Express.Multer.File & BaseFileUploadDto>;
}
