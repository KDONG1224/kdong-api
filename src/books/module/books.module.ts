// base
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// modules
import { CommonModule } from 'src/common/module/common.module';
import { UsersModule } from 'src/users/module/users.module';

// controllers
import { BooksController } from '../controller/books.controller';

// services
import { BooksService } from '../service/books.service';

// entities
import { BooksTable } from '../entity/books.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BooksTable]), CommonModule, UsersModule],
  controllers: [BooksController],
  providers: [BooksService]
})
export class BooksModule {}
