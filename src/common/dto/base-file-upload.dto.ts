import { PickType } from '@nestjs/swagger';
import { FileTable } from '../entites/file.entity';
import { IsNumber, IsOptional } from 'class-validator';

export class BaseFileUploadDto extends PickType(FileTable, [
  'key',
  'location',
  'contentType',
  'bucket'
]) {
  @IsNumber()
  @IsOptional()
  sequence?: number;
}
