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
import {
  PaginationPayload,
  WithPagination,
} from '../../../infrastructure/pagination/types/pagination.types';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import {
  BlogOutputModel,
  BlogOutputModelMapper,
} from './models/output/blog.output.model';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogInputModel } from './models/input/create-blog.input.model';
import { BlogsService } from '../application/blogs.service';
import { ValidateObjectIdPipe } from '../../../infrastructure/pipes/object-id.pipe';
import { PostInputModel } from '../../posts/api/models/input/create-post.input.model';
import { PostOutputModel } from '../../posts/api/models/output/post.output.model';
import { Types } from 'mongoose';
import { PostsService } from '../../posts/application/posts.service';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { Blog } from '../domain/Blog.entity';
import { UserAuthGuard } from '../../../infrastructure/guards/user-auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsRepository: BlogsRepository,
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

  @UseGuards(UserAuthGuard)
  @Post()
  async createBlog(
    @Body() blogInputData: BlogInputModel,
  ): Promise<BlogOutputModel> {
    const createdBlog: Blog = await this.blogsService.createBlog(blogInputData);

    return BlogOutputModelMapper(createdBlog);
  }

  @UseGuards(UserAuthGuard)
  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId', ValidateObjectIdPipe) blogId: Types.ObjectId,
    @Body()
    postInputData: Omit<PostInputModel, 'blogId'>,
  ): Promise<any> {
    const blog = await this.blogsRepository.findBlogById(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    const createdPostId = await this.postsService.createPost({
      ...postInputData,
      blogId: blogId,
    });

    const viewPost =
      await this.postsQueryRepository.findPostById(createdPostId);

    return viewPost!;
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
    );
  }

  @UseGuards(UserAuthGuard)
  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('blogId', ValidateObjectIdPipe) blogId: string) {
    const isBlogDeleted = await this.blogsService.deleteBlog(blogId);

    if (!isBlogDeleted) {
      throw new NotFoundException();
    }
  }

  @UseGuards(UserAuthGuard)
  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId', ValidateObjectIdPipe) blogId: Types.ObjectId,
    @Body() updateInfo: BlogInputModel,
  ) {
    const isBlogUpdated = await this.blogsService.updateBlog(
      blogId,
      updateInfo,
    );

    if (!isBlogUpdated) {
      throw new NotFoundException();
    }
  }
}
