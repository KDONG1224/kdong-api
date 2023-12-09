import { Module } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UsersController } from '../controller/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersTable } from '../entity/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersTable])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
