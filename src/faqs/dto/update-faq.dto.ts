import { PartialType } from '@nestjs/mapped-types';
import { FaqsTable } from '../entity/faqs.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFaqDto extends PartialType(FaqsTable) {
  @IsString()
  @IsOptional()
  question?: string;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsString()
  @IsOptional()
  faqType?: string;

  @IsNumber()
  @IsOptional()
  sequence?: number;
}
