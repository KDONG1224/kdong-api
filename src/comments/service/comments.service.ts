// base
import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';

// services
import { PostsService } from 'src/posts/service/posts.service';

// entites
import { CommentsTable } from '../entity/comments.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

// consts
import { ENV_JWT_SECRET_KEY } from 'src/common/consts/env-keys.const';

// libraries
import * as bcrypt from 'bcrypt';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsTable)
    private readonly commentsRepository: Repository<CommentsTable>,
    private readonly postsService: PostsService
  ) {}

  getRepository(qr: QueryRunner) {
    return qr
      ? qr.manager.getRepository<CommentsTable>(CommentsTable)
      : this.commentsRepository;
  }

  async getComments(postId: string) {
    const comments = await this.commentsRepository.find({
      where: {
        post: {
          id: postId
        }
      }
    });

    if (!comments) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    return {
      comments: comments.map((item) => {
        if (item.isPrivate) {
          return {
            ...item,
            comment: '비밀 댓글입니다.'
          };
        } else {
          return item;
        }
      }),
      message: '댓글 조회 성공'
    };
  }

  async getCommentById(commentId: string) {
    const comment = await this.commentsRepository.find({
      where: {
        id: commentId
      },
      relations: {
        post: true
      }
    });

    if (!comment || comment.length === 0) {
      throw new BadRequestException(
        `댓글 ${commentId} 에 해당하는 댓글이 없습니다.`
      );
    }

    return {
      comment,
      message: '특정 댓글 조회 성공'
    };
  }

  async createComment(dto: CreateCommentDto, postId: string, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const hash = await bcrypt.hash(dto.password, 10);

    const create = repository.create({
      ...dto,
      password: hash,
      post: { id: postId }
    });

    repository.save(create);

    return {
      comment: create,
      message: '댓글 작성 성공'
    };
  }

  async updateComment(commentId: string, dto: UpdateCommentDto) {
    const prevComment = await this.commentsRepository.preload({
      id: commentId,
      ...dto
    });

    if (!prevComment) {
      throw new BadRequestException(
        `댓글 ${commentId} 에 해당하는 댓글이 없습니다.`
      );
    }

    const newComment = await this.commentsRepository.save(prevComment);

    return newComment;
  }

  async deleteComment(commentId: string, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const comment = await repository.findOne({
      where: {
        id: commentId
      }
    });

    if (!comment) {
      throw new BadRequestException(
        `댓글 ${commentId} 에 해당하는 댓글이 없습니다.`
      );
    }

    await repository.delete(commentId);

    return {
      message: `댓글 ${commentId} 삭제 성공`
    };
  }

  async isCommentMine(commentId: string, body: UpdateCommentDto) {
    if (!body.username) {
      throw new UnauthorizedException('댓글 작성자를 확인해주세요.');
    }

    const existingUsername = await this.commentsRepository.findOne({
      where: {
        id: commentId,
        username: body.username
      }
    });

    if (!existingUsername) {
      throw new UnauthorizedException('댓글 작성자가 존재하지 않습니다.');
    }

    const passOk = await bcrypt.compare(
      body.password,
      existingUsername.password
    );

    return passOk;
  }
}
