// base
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// controller
import { MailerController } from '../controller/mailer.controller';

// service
import { MailerService } from '../service/mailer.service';

// entity
import { MailerTable } from '../entity/mailer.entity';

// libraries
import { MailerModule as MM } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([MailerTable]),
    MM.forRoot({
      transport: {
        service: 'Naver',
        host: 'smtp.naver.com',
        port: 587,
        auth: {
          user: 'gkfl8809',
          pass: 'alsdk9879*' // 네이버 비밀번호
        }
      },
      template: {
        dir: process.cwd() + '/template/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true
        }
      }
    })
  ],
  controllers: [MailerController],
  providers: [MailerService]
})
export class MailerModule {}
