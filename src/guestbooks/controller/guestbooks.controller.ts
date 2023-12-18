import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { GuestbooksService } from '../service/guestbooks.service';
import { CreateGuestbookDto } from '../dto/create-guestbook.dto';
import { UpdateGuestbookDto } from '../dto/update-guestbook.dto';
import { ChangeExposeGuestbookDto } from '../dto/chage-expose-guestbook.dto';

@Controller('guestbooks')
export class GuestbooksController {
  constructor(private readonly guestbooksService: GuestbooksService) {}

  @Get()
  async getGuestbooks() {
    return await this.guestbooksService.getGuestbooks();
  }

  @Post()
  async createGuestbook(@Body() body: CreateGuestbookDto) {
    return await this.guestbooksService.createGuestbook(body);
  }

  @Patch(':id')
  async updateGuestbook(
    @Param('id') id: string,
    @Body() body: UpdateGuestbookDto
  ) {
    return await this.guestbooksService.updateGuestbook(id, body);
  }

  @Patch('expose')
  async changeExposeGuestbook(@Body() body: ChangeExposeGuestbookDto) {
    return await this.guestbooksService.changeExposeGuestbook(body);
  }
}
