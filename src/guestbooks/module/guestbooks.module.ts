import { Module } from '@nestjs/common';
import { GuestbooksService } from '../service/guestbooks.service';
import { GuestbooksController } from '../controller/guestbooks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestbooksTable } from '../entity/guestbooks.entity';
import { CommonModule } from 'src/common/module/common.module';
import { AuthModule } from 'src/auth/module/auth.module';
import { UsersModule } from 'src/users/module/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GuestbooksTable]),
    CommonModule,
    AuthModule,
    UsersModule
  ],
  controllers: [GuestbooksController],
  providers: [GuestbooksService]
})
export class GuestbooksModule {}
