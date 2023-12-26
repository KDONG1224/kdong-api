// base
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { QueryRunner as QR } from 'typeorm';

// setvices
import { CommentsService } from '../service/comments.service';
import { PostsService } from 'src/posts/service/posts.service';

// dtos
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

// interceptors
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';

// guards
import { IsCommentMineOrAdminGuard } from '../guard/is-comment-mine-or-admin.guard';

// decorators
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService
  ) {}

  @Get(':postId')
  @IsPublic()
  async getComments(@Param('postId') postId: string) {
    return await this.commentsService.getComments(postId);
  }

  @Get(':postId/:commentId')
  @IsPublic()
  async getComment(@Param('commentId') commentId: string) {
    return await this.commentsService.getCommentById(commentId);
  }

  @Post(':postId')
  @IsPublic()
  @UseInterceptors(TransactionInterceptor)
  async postComment(
    @Param('postId') postId: string,
    @Body() body: CreateCommentDto,
    @QueryRunner() qr: QR
  ) {
    const result = await this.commentsService.createComment(body, postId, qr);

    await this.postsService.incrementCommentCount(postId, qr);

    return result;
  }

  @Patch(':postId/:commentId')
  @IsPublic()
  @UseGuards(IsCommentMineOrAdminGuard)
  async patchComment(
    @Param('commentId') commentId: string,
    @Body() body: UpdateCommentDto
  ) {
    return await this.commentsService.updateComment(commentId, body);
  }

  @Delete(':postId/:commentId')
  @IsPublic()
  // @UseGuards(IsCommentMineOrAdminGuard)
  @UseInterceptors(TransactionInterceptor)
  async deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @QueryRunner() qr: QR
  ) {
    const result = await this.commentsService.deleteComment(commentId, qr);

    await this.postsService.decrementCommentCount(postId, qr);

    return result;
  }
}
