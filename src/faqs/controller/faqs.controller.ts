// base
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// services
import { FaqsService } from '../service/faqs.service';

// dtos
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';

// decorators
import { Roles } from 'src/users/decorator/roles.decorator';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

// consts
import { RolesEnum } from 'src/users/consts/roles.const';

@ApiTags('Faqs')
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
