// base
import { IsOptional, IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';

// dtos
import { CreatePostsDto } from './create-posts.dto';

export class UpdatePostsDto extends PickType(CreatePostsDto, [
  'title',
  'content',
  'mainColor',
  'subColor'
]) {
  @IsString()
  @IsOptional()
  tags?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  hasThumbIds?: string;

  @IsString()
  @IsOptional()
  deleteThumbIds?: string;

  @IsString()
  @IsOptional()
  hasTagIds?: string;
}
