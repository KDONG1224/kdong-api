import { PartialType } from '@nestjs/mapped-types';
import { CreateGuestbookDto } from './create-guestbook.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGuestbookDto extends PartialType(CreateGuestbookDto) {
  @IsString()
  @IsOptional()
  guestName?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
