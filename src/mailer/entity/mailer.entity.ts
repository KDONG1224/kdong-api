import { IsBoolean, IsDate, IsEmail, IsString } from 'class-validator';
import { BaseTable } from 'src/common/entites/base.entity';
import { emailValidationMessage } from 'src/common/validation-message/email-validator.message';
import { Column, Entity } from 'typeorm';

@Entity()
export class MailerTable extends BaseTable {
  @Column()
  @IsString()
  clientName: string;

  @Column()
  @IsEmail(
    {},
    {
      message: emailValidationMessage
    }
  )
  clientEmail: string;

  @Column()
  @IsDate()
  eventDate: Date;

  @Column({
    default: false
  })
  @IsBoolean()
  isSend: boolean;
}
