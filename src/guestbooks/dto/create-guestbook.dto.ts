import { PickType } from '@nestjs/mapped-types';
import { GuestbooksTable } from '../entity/guestbooks.entity';

export class CreateGuestbookDto extends PickType(GuestbooksTable, [
  'guestName',
  'guestPassword',
  'content'
]) {}
