// base
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

// services
import { CategoriesService } from '../service/categories.service';

// entities
import { UsersTable } from 'src/users/entity/users.entity';

// dtos
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

// decorators
import { User } from 'src/users/decorator/user.decorator';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { Roles } from 'src/users/decorator/roles.decorator';

// consts
import { RolesEnum } from 'src/users/consts/roles.const';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategory(
    @User() user: UsersTable,
    @Body() body: CreateCategoryDto
  ) {
    return await this.categoriesService.createCategory(user, body);
  }

  @Get('/main')
  async getMainCategories() {
    return await this.categoriesService.getMainCategories();
  }

  @Get('/sub')
  @IsPublic()
  async getAllSubCategories() {
    return await this.categoriesService.getAllSubCategories();
  }

  @Get('/sub/:id')
  @IsPublic()
  async getSubCategories(@Param('id') id: string) {
    return await this.categoriesService.getSubCategories(id);
  }

  @Patch(':id')
  @Roles(RolesEnum.ADMIN)
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto
  ) {
    return await this.categoriesService.updateCategory(id, body);
  }
}
