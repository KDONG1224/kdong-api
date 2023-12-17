import { IsString } from 'class-validator';

export class SendMailerDto {
  @IsString()
  sendIds: string;
}
