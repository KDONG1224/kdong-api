import { Module } from '@nestjs/common';
import { NoticeService } from '../service/notice.service';
import { NoticeController } from '../controller/notice.controller';
import { UsersModule } from 'src/users/module/users.module';
import { NoticeTable } from '../entities/notice.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([NoticeTable]), UsersModule],
  controllers: [NoticeController],
  providers: [NoticeService]
})
export class NoticeModule {}
