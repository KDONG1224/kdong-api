import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { FaqsService } from '../service/faqs.service';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/consts/roles.const';
import { UpdateFaqDto } from '../dto/update-faq.dto';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  @IsPublic()
  async findAllFaqLists() {
    return await this.faqsService.findAllFaqLists();
  }

  @Get(':id')
  @IsPublic()
  async findFaqList(@Param('id') id: string) {
    return await this.faqsService.findFaqList(id);
  }

  @Post()
  @Roles(RolesEnum.ADMIN)
  async createFaq(@Body() body: CreateFaqDto) {
    return await this.faqsService.createFaq(body);
  }

  @Patch(':id')
  @Roles(RolesEnum.ADMIN)
  async updateFaq(@Param('id') id: string, @Body() body: UpdateFaqDto) {
    return await this.faqsService.updateFaq(id, body);
  }

  @Patch('expose/:id')
  @Roles(RolesEnum.ADMIN)
  async updateExpose(
    @Param('id') id: string,
    @Body() body: { expose: boolean }
  ) {
    return await this.faqsService.updateExpose(id, body);
  }
}
