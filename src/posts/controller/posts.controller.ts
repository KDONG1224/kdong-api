// base
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { QueryRunner as QR } from 'typeorm';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

// services
import { PostsService } from '../service/posts.service';

// entities
import { PostsTable } from '../entity/posts.entity';
import { UsersTable } from 'src/users/entity/users.entity';

// dtos
import { CreatePostsDto } from '../dtos/create-posts.dto';
import { UpdatePostsDto } from '../dtos/update-posts.dto';
import { PaginatePostsDto } from '../dtos/paginate-posts.dto';

// decorators
import { Roles } from 'src/users/decorator/roles.decorator';
import { User } from 'src/users/decorator/user.decorator';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';

// guards
import { IsPostMineOrAdminGuard } from '../guard/is-post-mine-or-admin.guard';

// interceptors
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';

// consts
import { RolesEnum } from 'src/users/consts/roles.const';
import { TagsService } from 'src/tags/service/tags.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommonService } from 'src/common/service/common.service';
import { BaseFileUploadDto } from 'src/common/dto/base-file-upload.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly tagsSerivce: TagsService,
    private readonly commonService: CommonService
  ) {}

  @Get()
  @ApiOperation({ summary: '모든 게시글 가져오기' })
  @ApiOkResponse({ description: '모든 게시글 가져온다.', type: [PostsTable] })
  @IsPublic()
  async getAllPosts(@Query() query: PaginatePostsDto) {
    if (!query.order__createdAt) {
      query.order__createdAt = 'ASC';
    }

    if (!query.take) {
      query.take = 20;
    }

    return await this.postsService.getAllPosts(query);
  }

  @Post('dummy')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: '더미 게시글 생성' })
  async postDummyPosts(@User() user: UsersTable) {
    return await this.postsService.generatePosts(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 게시글 가져오기' })
  @IsPublic()
  getPostById(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @Roles(RolesEnum.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('thumbnails'))
  @ApiOperation({ summary: '게시글 생성' })
  async postPosts(
    @User('id') id: string,
    @UploadedFiles() thumbnails: Array<Express.Multer.File & BaseFileUploadDto>,
    @Body() body: CreatePostsDto,
    @QueryRunner() qr: QR
  ) {
    const post = await this.postsService.createPosts(id, body);

    const tags = body.tags.split(',');

    for (let i = 0; i < tags.length; i++) {
      await this.tagsSerivce.createTag(
        {
          post,
          tag: tags[i]
        },
        qr
      );
    }

    for (let i = 0; i < thumbnails.length; i++) {
      await this.commonService.uploadFile(
        id,
        post.id,
        { ...thumbnails[i], sequence: i + 1 },
        qr
      );
    }

    return post;
  }

  @Patch(':id')
  @UseGuards(IsPostMineOrAdminGuard)
  @ApiOperation({ summary: '게시글 수정' })
  patchPosts(@Param('id') id: string, @Body() body: UpdatePostsDto) {
    return this.postsService.updatePosts(id, body);
  }

  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: '게시글 삭제' })
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }

  @Post('/like/:id')
  @ApiOperation({ summary: '게시글 좋아요' })
  postLikePost(@Param('id') id: string) {
    return this.postsService.likePost(id);
  }
}
