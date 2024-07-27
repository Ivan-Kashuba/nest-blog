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
import { BlogsMongoQueryRepository } from '../infrastructure/blogs-mongo-query.repository';
import { BlogInputModel } from './models/input/create-blog.input.model';
import { BlogsService } from '../application/blogs.service';
import { ValidateObjectIdPipe } from '../../../infrastructure/pipes/object-id.pipe';
import { PostOutputModel } from '../../posts/api/models/output/post.output.model';
import { Types } from 'mongoose';
import { PostsService } from '../../posts/application/posts.service';
import { BlogsMongoRepository } from '../infrastructure/blogs-mongo.repository';
import { PostsMongoQueryRepository } from '../../posts/infrastructure/posts-mongo-query.repository';
import { Blog } from '../domain/Blog.entity';
import { AdminAuthGuard } from '../../../infrastructure/guards/admin-auth.guard';
import { User } from '../../../infrastructure/decorators/transform/get-user';
import { PostForBlogInputModel } from './models/input/create-post-for-blog.input.model';
import { PostEditForBlogInputModel } from '../../posts/api/models/input/create-post.input.model';

@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly blogsQueryRepository: BlogsMongoQueryRepository,
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsMongoQueryRepository,
    private readonly blogsRepository: BlogsMongoRepository,
  ) {}

  @UseGuards(AdminAuthGuard)
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

  @UseGuards(AdminAuthGuard)
  @Post()
  async createBlog(
    @Body() blogInputData: BlogInputModel,
  ): Promise<BlogOutputModel> {
    const createdBlog: Blog = await this.blogsService.createBlog(blogInputData);

    return BlogOutputModelMapper(createdBlog);
  }

  @UseGuards(AdminAuthGuard)
  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId', ValidateObjectIdPipe) blogId: Types.ObjectId,
    @Body()
    postInputData: PostForBlogInputModel,
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

  @UseGuards(AdminAuthGuard)
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

  @UseGuards(AdminAuthGuard)
  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('blogId', ValidateObjectIdPipe) blogId: string) {
    const isBlogDeleted = await this.blogsService.deleteBlog(blogId);

    if (!isBlogDeleted) {
      throw new NotFoundException();
    }
  }

  @UseGuards(AdminAuthGuard)
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

  @UseGuards(AdminAuthGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('postId', ValidateObjectIdPipe) postId: Types.ObjectId,
    @Param('blogId', ValidateObjectIdPipe) blogId: Types.ObjectId,
    @Body() updateInfo: PostEditForBlogInputModel,
  ) {
    const blog = await this.blogsQueryRepository.findBlogById(
      blogId.toString(),
    );

    if (!blog) {
      throw new NotFoundException();
    }

    const isPostUpdated = await this.postsService.updatePost(postId, {
      ...updateInfo,
      blogId,
    });

    if (!isPostUpdated) {
      throw new NotFoundException();
    }
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('postId', ValidateObjectIdPipe) postId: Types.ObjectId,
    @Param('blogId', ValidateObjectIdPipe) blogId: Types.ObjectId,
  ) {
    const blog = await this.blogsQueryRepository.findBlogById(
      blogId.toString(),
    );

    if (!blog) {
      throw new NotFoundException();
    }

    const isPostDeleted = await this.postsService.deletePost(postId);

    if (!isPostDeleted) {
      throw new NotFoundException();
    }
  }
}
