// base
import { Equal, Not, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

// entities
import { CategoriesTable } from '../entity/categories.entity';
import { UsersTable } from 'src/users/entity/users.entity';

// dtos
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

// consts
import { DEFAULT_CATEGORY_FIND_OPTIONS } from '../consts/default-category-find-options';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesTable)
    private readonly categoriesRepository: Repository<CategoriesTable>
  ) {}

  async createCategory(user: UsersTable, body: CreateCategoryDto) {
    const category = this.categoriesRepository.create({
      ...body,
      createdByUserId: user.id
    });

    await this.categoriesRepository.save(category);

    return {
      category,
      message: '카테고리 생성 성공'
    };
  }

  async getMainCategories() {
    const categories = await this.categoriesRepository.find({
      where: {
        ...DEFAULT_CATEGORY_FIND_OPTIONS.where,
        subCategoryNumber: 0
      }
    });

    return {
      categories,
      message: '메인 카테고리 조회 성공'
    };
  }

  async getAllSubCategories() {
    const subCategories = await this.categoriesRepository.find({
      where: {
        ...DEFAULT_CATEGORY_FIND_OPTIONS.where,
        subCategoryNumber: Not(Equal(0))
      }
    });

    return {
      subCategories,
      message: '모든 서브 카테고리 조회 성공'
    };
  }

  async getSubCategories(id: string) {
    const categories = await this.categoriesRepository.find({
      where: {
        ...DEFAULT_CATEGORY_FIND_OPTIONS.where,
        id
      }
    });

    const subCategories = await this.categoriesRepository.find({
      where: {
        ...DEFAULT_CATEGORY_FIND_OPTIONS.where,
        categoryNumber: categories[0].categoryNumber,
        subCategoryNumber: Not(Equal(0))
      }
    });

    return {
      subCategories,
      message: '서브 카테고리 조회 성공'
    };
  }

  async updateCategory(id: string, body: UpdateCategoryDto) {
    const find = await this.categoriesRepository.findOne({
      where: {
        ...DEFAULT_CATEGORY_FIND_OPTIONS.where,
        id
      }
    });

    if (!find) {
      throw new NotFoundException('해당하는 카테고리가 없습니다.');
    }

    const data = {
      ...find,
      ...body
    };

    const result = await this.categoriesRepository.save(data);

    return {
      category: result,
      message: '카테고리 수정 성공'
    };
  }
}
