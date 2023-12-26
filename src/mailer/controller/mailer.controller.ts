// base
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// service
import { MailerService } from '../service/mailer.service';

// dto
import { CreateMailerDto } from '../dto/create-mailer.dto';
import { SendMailerDto } from '../dto/send-mailer.dto';

// decorator
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { Roles } from 'src/users/decorator/roles.decorator';

// consts
import { RolesEnum } from 'src/users/consts/roles.const';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Get()
  async getMailLists() {
    return await this.mailerService.getMailLists();
  }

  @Post()
  @IsPublic()
  async addMail(@Body() body: CreateMailerDto) {
    return await this.mailerService.addMail(body);
  }

  @Post('send')
  @Roles(RolesEnum.ADMIN)
  async sendMail(@Body() body: SendMailerDto) {
    return await this.mailerService.sendMail(body);
  }
}
