import { Module } from '@nestjs/common';
import { GuestbooksService } from '../service/guestbooks.service';
import { GuestbooksController } from '../controller/guestbooks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestbooksTable } from '../entity/guestbooks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuestbooksTable])],
  controllers: [GuestbooksController],
  providers: [GuestbooksService]
})
export class GuestbooksModule {}
