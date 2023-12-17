// base
import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// entity
import { MailerTable } from '../entity/mailer.entity';
import { CreateMailerDto } from '../dto/create-mailer.dto';

// libraries
import { MailerService as MS } from '@nestjs-modules/mailer';
import { SendMailerDto } from '../dto/send-mailer.dto';

@Injectable()
export class MailerService {
  constructor(
    @InjectRepository(MailerTable)
    private readonly mailerRepository: Repository<MailerTable>,

    private readonly mailerService: MS
  ) {}

  async getMailLists() {
    const result = await this.mailerRepository.find();

    return {
      ...result,
      message: '메일 리스트 조회 성공'
    };
  }

  async addMail(body: CreateMailerDto) {
    const data = {
      ...body,
      eventDate: new Date()
    };

    const mailer = this.mailerRepository.create(data);

    await this.mailerRepository.save(mailer);

    return {
      ...mailer,
      message: '메일 요청 성공'
    };
  }

  async sendMail(body: SendMailerDto) {
    // const number: number = Math.floor(100000 + Math.random() * 900000);
    // await this.mailerService.sendMail({
    //   to: 'gkfl8807@gmail.com',
    //   from: 'gkfl8809@naver.com',
    //   subject: '이메일 인증 요청 메일입니다.',
    //   html: '6자리 인증 코드 : ' + `<b> ${number}</b>`
    // });

    const split = body.sendIds.split(',');

    for (let i = 0; i < split.length; i++) {
      const id = split[i];

      const result = await this.mailerRepository.findOne({
        where: { id }
      });

      if (!result) {
        throw new BadRequestException('해당하는 Wanted 요청이 없습니다.');
      }

      const { clientName, clientEmail } = result;

      await this.mailerService.sendMail({
        to: clientEmail,
        from: 'gkfl8809@naver.com',
        subject: `${clientName}님 KDONG Blog Wanted 요청주신 메일이 도착했습니다.`,
        template: './welcome',
        context: {
          name: clientName,
          notionLink:
            'https://noyclah.notion.site/ad709f3f88b64cbb87672246749713f0?pvs=4'
        }
      });

      await this.mailerRepository.update(
        {
          id: split[i]
        },
        {
          isSend: true
        }
      );
    }

    return {
      message: '메일 발송 성공'
    };
  }
}
