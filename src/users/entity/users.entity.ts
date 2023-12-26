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
import { ApiProperty } from '@nestjs/swagger';

// entites
import { BaseTable } from 'src/common/entites/base.entity';
import { PostsTable } from 'src/posts/entity/posts.entity';
import { FileTable } from 'src/common/entites/file.entity';

// consts
import { RolesEnum } from '../consts/roles.const';

// validation-message
import { emailValidationMessage } from 'src/common/validation-message/email-validator.message';
import { legthValidationMessage } from 'src/common/validation-message/legth-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

@Entity()
export class UsersTable extends BaseTable {
  @Column({ unique: true })
  @IsString({
    message: stringValidationMessage
  })
  @ApiProperty({ example: 'client001', description: '아이디' })
  userid: string;

  @Column({ length: 20, unique: true })
  @IsString({
    message: stringValidationMessage
  })
  @ApiProperty({ example: 'client001', description: '이름' })
  username: string;

  @Column()
  @IsString({
    message: stringValidationMessage
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage
    }
  )
  @ApiProperty({ example: 'gkfl8809@naver.com', description: '이메일' })
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage
  })
  @Length(3, 8, {
    message: legthValidationMessage
  })
  @Exclude({ toPlainOnly: true })
  @ApiProperty({ example: '1234', description: '비밀번호' })
  password: string;

  @Column()
  @IsPhoneNumber('KR', {
    message: '올바른 전화번호 형식이 아닙니다.'
  })
  @ApiProperty({ example: '01012341234', description: '전화번호' })
  phoneNumber: string;

  @Column()
  @IsDateString()
  @ApiProperty({ example: '19931224', description: '생년월일' })
  birthday: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER
  })
  @ApiProperty({ example: 'USER', description: '유저권한' })
  role: RolesEnum;

  @Column({
    default: true
  })
  @IsBoolean()
  status?: boolean;

  @OneToMany(() => PostsTable, (post) => post.author)
  articles: PostsTable[];

  @OneToMany(() => FileTable, (file) => file.author, { eager: true })
  @Exclude({ toPlainOnly: true })
  files: FileTable[];
}
