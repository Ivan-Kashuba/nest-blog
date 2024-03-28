import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  PaginationPayload,
  WithPagination,
} from '../../../common/pagination/types/pagination.types';
import { PaginationService } from '../../../common/pagination/service/pagination.service';

import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository';

import { PostsService } from '../application/posts.service';
import { ValidateObjectIdPipe } from '../../../common/pipes/object-id.pipe';
import { PostInputModel } from './models/input/create-post.input.model';
import { Types } from 'mongoose';

import { PostsRepository } from '../infrastructure/posts.repository';
import { TPostDocument } from '../domain/Post.entity';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { PostOutputModel } from './models/output/post.output.model';
import { CommentOutputModel } from '../../comments/api/models/output/comment.output.model';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsRepository: PostsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async getPosts(
    @Query()
    queryParams: { title?: string } & Partial<
      PaginationPayload<PostOutputModel>
    >,
  ): Promise<WithPagination<PostOutputModel>> {
    const titleToFind = queryParams?.title || null;
    const pagination: PaginationPayload<PostOutputModel> =
      this.paginationService.validatePayloadPagination(
        queryParams,
        'createdAt',
      );

    return await this.postsQueryRepository.findPosts(titleToFind, pagination);
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
  ): Promise<PostOutputModel> {
    const foundedPost = await this.postsQueryRepository.findPostById(postId);

    if (!foundedPost) {
      throw new NotFoundException();
    }

    return foundedPost;
  }

  @Get(':postId/comments')
  async getPostComments(
    @Query() queryParams: Partial<PaginationPayload<CommentOutputModel>>,
    @Param('postId', ValidateObjectIdPipe) postId: Types.ObjectId,
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
    );
  }

  @Delete(':postId')
  @HttpCode(204)
  async deletePost(
    @Param('postId', ValidateObjectIdPipe) postId: Types.ObjectId,
  ) {
    const isPostDeleted = await this.postsService.deletePost(postId);

    if (!isPostDeleted) {
      throw new NotFoundException();
    }
  }

  @Put(':postId')
  @HttpCode(204)
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
}
