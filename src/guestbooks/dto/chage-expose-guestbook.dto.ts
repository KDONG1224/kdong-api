import { PickType } from '@nestjs/mapped-types';
import { GuestbooksTable } from '../entity/guestbooks.entity';

export class ChangeExposeGuestbookDto extends PickType(GuestbooksTable, [
  'expose'
]) {}
