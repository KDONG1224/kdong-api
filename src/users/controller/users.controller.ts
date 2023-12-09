// base
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// services
import { UsersService } from '../service/users.service';

// decorators
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @IsPublic()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  getUserInfo(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}
