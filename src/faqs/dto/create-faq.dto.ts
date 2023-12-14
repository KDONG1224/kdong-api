import { PickType } from '@nestjs/mapped-types';
import { FaqsTable } from '../entity/faqs.entity';

export class CreateFaqDto extends PickType(FaqsTable, [
  'answer',
  'faqType',
  'question'
]) {}
