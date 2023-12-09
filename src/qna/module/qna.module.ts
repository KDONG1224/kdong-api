import { Module } from '@nestjs/common';
import { QnaService } from '../service/qna.service';
import { QnaController } from '../controller/qna.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QnaTable } from '../entities/qna.entity';
import { UsersModule } from 'src/users/module/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([QnaTable]), UsersModule],
  controllers: [QnaController],
  providers: [QnaService]
})
export class QnaModule {}
