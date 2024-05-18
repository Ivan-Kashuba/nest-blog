import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository';

import { PostsService } from '../application/posts.service';

import { PostInputModel } from './models/input/create-post.input.model';
import { Types } from 'mongoose';

import { PostsRepository } from '../infrastructure/posts.repository';
import { TPostDocument } from '../domain/Post.entity';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { PostOutputModel } from './models/output/post.output.model';
import { CommentOutputModel } from '../../comments/api/models/output/comment.output.model';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import {
  PaginationPayload,
  WithPagination,
} from '../../../infrastructure/pagination/types/pagination.types';
import { ValidateObjectIdPipe } from '../../../infrastructure/pipes/object-id.pipe';
import { User } from '../../../infrastructure/decorators/transform/get-user';
import { CommentInputModel } from '../../comments/api/models/input/create-comment.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../application/use-cases/create-comment.handler';
import { UserAuthGuard } from '../../../infrastructure/guards/user-auth.guard';
import { UserTokenInfo } from '../../auth/types/auth.types';
import { UpdatePostLikeStatusCommand } from '../application/use-cases/update-post-like-status.handler';
import { LikeInputModel } from '../../likes/api/models/input/like.input.model';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsRepository: PostsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getPosts(
    @Query()
    queryParams: { title?: string } & Partial<
      PaginationPayload<PostOutputModel>
    >,
    @User('userId') userId: Types.ObjectId,
  ): Promise<WithPagination<PostOutputModel>> {
    const titleToFind = queryParams?.title || null;
    const pagination: PaginationPayload<PostOutputModel> =
      this.paginationService.validatePayloadPagination(
        queryParams,
        'createdAt',
      );

    return await this.postsQueryRepository.findPosts(
      titleToFind,
      pagination,
      userId,
    );
  }

  @Post()
  async createPost(
    @Body() postInputData: PostInputModel,
  ): Promise<PostOutputModel> {
    const createdPostId = await this.postsService.createPost(postInputData);

    const viewPost =
      await this.postsQueryRepository.findPostById(createdPostId);

    return viewPost!;
  }

  @Get(':postId')
  async getPost(
    @Param('postId', ValidateObjectIdPipe) postId: Types.ObjectId,
    @User('userId') userId: Types.ObjectId,
  ): Promise<PostOutputModel> {
    const foundedPost = await this.postsQueryRepository.findPostById(
      postId,
      userId,
    );

    if (!foundedPost) {
      throw new NotFoundException();
    }

    return foundedPost;
  }

  @Get(':postId/comments')
  async getPostComments(
    @Query() queryParams: Partial<PaginationPayload<CommentOutputModel>>,
    @Param('postId', ValidateObjectIdPipe) postId: Types.ObjectId,
    @User('userId') userId: Types.ObjectId,
  ): Promise<WithPagination<CommentOutputModel>> {
    const pagination: PaginationPayload<CommentOutputModel> =
      this.paginationService.validatePayloadPagination(
        queryParams,
        'createdAt',
      );

    const post: TPostDocument | null =
      await this.postsRepository.findPostById(postId);

    if (!post) {
      throw new NotFoundException();
    }

    return await this.commentsQueryRepository.findCommentsByPostId(
      postId,
      pagination,
      userId,
    );
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('postId', ValidateObjectIdPipe) postId: Types.ObjectId,
  ) {
    const isPostDeleted = await this.postsService.deletePost(postId);

    if (!isPostDeleted) {
      throw new NotFoundException();
    }
  }

  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('postId', ValidateObjectIdPipe) postId: Types.ObjectId,
    @Body() updateInfo: PostInputModel,
  ) {
    const isPostUpdated = await this.postsService.updatePost(
      postId,
      updateInfo,
    );

    if (!isPostUpdated) {
      throw new NotFoundException();
    }
  }

  @UseGuards(UserAuthGuard)
  @Post(':postId/comments')
  @HttpCode(HttpStatus.CREATED)
  async createCommentForPost(
    @Param('postId', ValidateObjectIdPipe) postId: Types.ObjectId,
    @Body() comment: CommentInputModel,
    @User() user: UserTokenInfo,
  ) {
    const createCommentCommand = new CreateCommentCommand({
      postId,
      user,
      content: comment.content,
    });

    const createdCommentId =
      await this.commandBus.execute(createCommentCommand);

    return await this.commentsQueryRepository.findCommentById(createdCommentId);
  }

  @UseGuards(UserAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostLikeStatus(
    @Param('postId', ValidateObjectIdPipe) postId: Types.ObjectId,
    @Body() { likeStatus }: LikeInputModel,
    @User() user: UserTokenInfo,
  ) {
    const updatePostLikeCommand = new UpdatePostLikeStatusCommand({
      postId,
      likeStatus,
      user,
    });

    await this.commandBus.execute(updatePostLikeCommand);
  }
}
