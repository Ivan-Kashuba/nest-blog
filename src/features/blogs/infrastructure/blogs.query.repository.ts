import { Injectable } from '@nestjs/common';
import { Blog, TBlogModel } from '../domain/Blog.entity';
import {
  PaginationPayload,
  WithPagination,
} from '../../../infrastructure/pagination/types/pagination.types';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import {
  BlogOutputModel,
  BlogOutputModelMapper,
} from '../api/models/output/blog.output.model';
import { PostOutputModel } from '../../posts/api/models/output/post.output.model';
import { Types } from 'mongoose';
import { PostModelAfterAggregation } from '../../posts/domain/post.type';
import { Post, TPostModel } from '../../posts/domain/Post.entity';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: TBlogModel,
    @InjectModel(Post.name) private PostModel: TPostModel,
    private readonly paginationService: PaginationService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async findBlogs(
    blogName: string | null,
    pagination: PaginationPayload<BlogOutputModel>,
  ): Promise<WithPagination<BlogOutputModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;
    let filters = {};

    if (blogName) {
      filters = {
        name: this.paginationService.getInsensitiveCaseSearchRegexString(
          blogName,
        ),
      };
    }

    const totalCount = await this.BlogModel.countDocuments(filters);

    const foundedBlogs: Blog[] = await this.BlogModel.find(filters)
      .sort({
        [sortBy]:
          this.paginationService.getSortDirectionMongoValue(sortDirection),
      })
      .skip(this.paginationService.getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize);

    return this.paginationService.createPaginationResponse<BlogOutputModel>(
      pagination,
      foundedBlogs.map((b) => BlogOutputModelMapper(b)),
      totalCount,
    );
  }

  async findPostsForBlog(
    blog: BlogOutputModel,
    pagination: PaginationPayload<PostOutputModel>,
    userId?: Types.ObjectId,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;

    const filter = { blogId: new Types.ObjectId(blog.id) };

    const totalCount = await this.PostModel.countDocuments(filter);

    const foundPosts = (await this.PostModel.aggregate(
      this.postsQueryRepository._getPostWithBlogNameAggregate(filter),
    )
      .sort({
        [sortBy]:
          this.paginationService.getSortDirectionMongoValue(sortDirection),
      })
      .skip(this.paginationService.getSkip(pageNumber, pageSize))
      .limit(pageSize)) as PostModelAfterAggregation[];

    const viewModelFoundedPosts = foundPosts.map((post) =>
      this.postsQueryRepository._mapDbPostModelToViewModel(post, userId),
    );

    return this.paginationService.createPaginationResponse<PostOutputModel>(
      pagination,
      viewModelFoundedPosts,
      totalCount,
    );
  }

  async findBlogById(blogId: string) {
    const foundBlog = await this.BlogModel.findOne({ _id: blogId });
    if (foundBlog) {
      return BlogOutputModelMapper(foundBlog);
    }
    return null;
  }
}
