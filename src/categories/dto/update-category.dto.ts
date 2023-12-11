import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { DeleteEnum } from '../consts/deletes.const';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsString()
  @IsOptional()
  categoryName?: string;

  @IsNumber()
  @IsOptional()
  categoryNumber?: number;

  @IsNumber()
  @IsOptional()
  subCategoryNumber?: number;

  @IsString()
  @IsOptional()
  deleteStatus?: DeleteEnum;
}
