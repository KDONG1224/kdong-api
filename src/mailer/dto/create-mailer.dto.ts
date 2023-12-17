import { PickType } from '@nestjs/mapped-types';
import { MailerTable } from '../entity/mailer.entity';

export class CreateMailerDto extends PickType(MailerTable, [
  'clientName',
  'clientEmail'
]) {}
