import { PickType } from '@nestjs/mapped-types';
import { GuestbooksTable } from '../entity/guestbooks.entity';
import { IsString } from 'class-validator';

export class ChangeExposeGuestbookDto extends PickType(GuestbooksTable, [
  'expose'
]) {
  @IsString()
  exposeIds: string;
}
