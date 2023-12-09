// base
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsPhoneNumber,
  IsString,
  Length
} from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

// entites
import { BaseTable } from 'src/common/entites/base.entity';
import { PostsTable } from 'src/posts/entity/posts.entity';

// consts
import { RolesEnum } from '../consts/roles.const';

// validation-message
import { emailValidationMessage } from 'src/common/validation-message/email-validator.message';
import { legthValidationMessage } from 'src/common/validation-message/legth-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { FileTable } from 'src/common/entites/file.entity';

@Entity()
export class UsersTable extends BaseTable {
  @Column({ unique: true })
  @IsString({
    message: stringValidationMessage
  })
  userid: string;

  @Column({ length: 20, unique: true })
  @IsString({
    message: stringValidationMessage
  })
  @Length(1, 20, {
    message: legthValidationMessage
  })
  username: string;

  @Column({ unique: true })
  @IsString({
    message: stringValidationMessage
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage
    }
  )
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage
  })
  @Length(3, 8, {
    message: legthValidationMessage
  })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  @IsPhoneNumber('KR', {
    message: '올바른 전화번호 형식이 아닙니다.'
  })
  phoneNumber: string;

  @Column()
  @IsDateString()
  birthday: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER
  })
  role: RolesEnum;

  @Column({
    default: true
  })
  @IsBoolean()
  status?: boolean;

  @OneToMany(() => PostsTable, (post) => post.author)
  articles: PostsTable[];

  @OneToMany(() => FileTable, (file) => file.author, { eager: true })
  files: FileTable[];
}
