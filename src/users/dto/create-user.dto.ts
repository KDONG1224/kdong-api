import { OmitType } from '@nestjs/mapped-types';
import { UsersTable } from '../entity/users.entity';

export class CreateUserDto extends OmitType(UsersTable, [
  'role',
  'status',
  'articles'
]) {}
