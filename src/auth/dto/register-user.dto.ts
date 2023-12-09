import { OmitType } from '@nestjs/mapped-types';
import { UsersTable } from 'src/users/entity/users.entity';

export class RegisterUserDto extends OmitType(UsersTable, [
  'role',
  'status',
  'articles'
]) {}
