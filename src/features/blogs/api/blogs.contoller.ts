import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  PaginationPayload,
  WithPagination,
} from '../../../infrastructure/pagination/types/pagination.types';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import { BlogOutputModel } from './models/output/blog.output.model';
import { BlogsMongoQueryRepository } from '../infrastructure/blogs-mongo-query.repository';
import { ValidateObjectIdPipe } from '../../../infrastructure/pipes/object-id.pipe';
import { PostOutputModel } from '../../posts/api/models/output/post.output.model';
import { Types } from 'mongoose';
import { User } from '../../../infrastructure/decorators/transform/get-user';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly blogsQueryRepository: BlogsMongoQueryRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query()
    queryParams: { searchNameTerm?: string | null } & Partial<
      PaginationPayload<BlogOutputModel>
    >,
  ): Promise<WithPagination<BlogOutputModel>> {
    const nameToFind = queryParams?.searchNameTerm || null;
    const pagination = this.paginationService.validatePayloadPagination(
      queryParams,
      'createdAt',
    );

    return await this.blogsQueryRepository.findBlogs(nameToFind, pagination);
  }

  @Get(':blogId')
  async getBlog(
    @Param('blogId', ValidateObjectIdPipe) blogId: string,
  ): Promise<BlogOutputModel> {
    const foundedBlog = await this.blogsQueryRepository.findBlogById(blogId);

    if (!foundedBlog) {
      throw new NotFoundException();
    }

    return foundedBlog;
  }

  @Get(':blogId/posts')
  async getPostsForBlog(
    @Query() queryParams: Partial<PaginationPayload<PostOutputModel>>,
    @Param('blogId', ValidateObjectIdPipe) blogId: string,
    @User('userId') userId: Types.ObjectId,
  ): Promise<WithPagination<PostOutputModel>> {
    const foundedBlog = await this.blogsQueryRepository.findBlogById(blogId);

    const pagination = this.paginationService.validatePayloadPagination(
      queryParams,
      'createdAt',
    );

    if (!foundedBlog) {
      throw new NotFoundException();
    }

    return await this.blogsQueryRepository.findPostsForBlog(
      foundedBlog,
      pagination,
      userId,
    );
  }
}
