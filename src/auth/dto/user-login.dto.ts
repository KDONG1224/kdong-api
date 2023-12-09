import { PickType } from '@nestjs/swagger';
import { UsersTable } from 'src/users/entity/users.entity';

export class UserLoginDto extends PickType(UsersTable, [
  'userid',
  'password'
]) {}
