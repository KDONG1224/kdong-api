// base
// import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// entities
import { PostsTable } from '../entity/posts.entity';

// dtos
import { BaseFileUploadDto } from 'src/common/dto/base-file-upload.dto';
import { PickType } from '@nestjs/swagger';

export class CreatePostsDto extends PickType(PostsTable, ['title', 'content']) {
  @IsString({
    each: true
  })
  @IsOptional()
  @ApiProperty({ description: '태그들' })
  tags?: string;

  @Type(() => Array<Express.Multer.File & BaseFileUploadDto>)
  @IsOptional()
  @ApiProperty({
    description: '썸네일',
    type: () => Array<Express.Multer.File & BaseFileUploadDto>
  })
  thumbnails?: Array<Express.Multer.File & BaseFileUploadDto>;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '카테고리', required: false })
  category?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '메인 색상', required: false })
  mainColor?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '서브 색상', required: false })
  subColor?: string;
}
