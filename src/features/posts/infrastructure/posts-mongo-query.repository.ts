import { Injectable } from '@nestjs/common';
import {
  PaginationPayload,
  WithPagination,
} from '../../../infrastructure/pagination/types/pagination.types';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import { NewestLikeViewModel } from '../../likes/api/models/output/extended-like.input.model';
import { LIKE_STATUS } from '../../likes/domain/like.type';
import { PipelineStage, Types } from 'mongoose';
import { PostModelAfterAggregation } from '../../comments/domain/comments.type';
import { Post, TPostModel } from '../domain/Post.entity';
import { PostOutputModel } from '../api/models/output/post.output.model';

@Injectable()
export class PostsMongoQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: TPostModel,
    private readonly paginationService: PaginationService,
  ) {}

  async findPosts(
    title: string | null,
    pagination: PaginationPayload<PostOutputModel>,
    userId?: Types.ObjectId,
  ): Promise<WithPagination<PostOutputModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;
    let filters = {};

    if (title) {
      filters = {
        title:
          this.paginationService.getInsensitiveCaseSearchRegexString(title),
      };
    }

    const totalCount = await this.PostModel.countDocuments(filters);

    const foundPosts = (await this.PostModel.aggregate(
      this._getPostWithBlogNameAggregate(filters),
    )
      .sort({
        [sortBy]:
          this.paginationService.getSortDirectionMongoValue(sortDirection),
      })
      .skip(this.paginationService.getSkip(pageNumber, pageSize))
      .limit(pageSize)) as PostModelAfterAggregation[];

    const viewModelFoundedPosts = foundPosts.map((post) =>
      this._mapDbPostModelToViewModel(post, userId),
    );

    return this.paginationService.createPaginationResponse<PostOutputModel>(
      pagination,
      viewModelFoundedPosts,
      totalCount,
    );
  }

  async findPostById(postId: Types.ObjectId, userId?: Types.ObjectId) {
    const postWithDbExtendedLikesInfo = (
      await this.PostModel.aggregate(
        this._getPostWithBlogNameAggregate({ _id: new Types.ObjectId(postId) }),
      )
    )[0] as unknown as PostModelAfterAggregation;

    return postWithDbExtendedLikesInfo
      ? this._mapDbPostModelToViewModel(postWithDbExtendedLikesInfo, userId)
      : null;
  }

  _mapDbPostModelToViewModel(
    postWithDbExtendedLikesInfo: PostModelAfterAggregation,
    userId?: Types.ObjectId,
  ) {
    const postStatusByUser =
      postWithDbExtendedLikesInfo?.extendedLikesInfo?.extendedLikes?.find(
        (like) => like.userId === userId,
      )?.status;

    const newestLikes =
      postWithDbExtendedLikesInfo?.extendedLikesInfo?.extendedLikes
        ?.filter((like) => like.status === LIKE_STATUS.Like)
        ?.sort(
          (like_a, like_b) =>
            new Date(like_b.firstLikeDate!).getTime() -
            new Date(like_a.firstLikeDate!).getTime(),
        )
        ?.slice(0, 3)
        ?.map((like) => {
          const newestLike: NewestLikeViewModel = {
            addedAt: like.addedAt,
            userId: like.userId,
            login: like.userLogin,
          };

          return newestLike;
        });

    const postViewModel: PostOutputModel = {
      title: postWithDbExtendedLikesInfo.title,
      createdAt: postWithDbExtendedLikesInfo.createdAt,
      content: postWithDbExtendedLikesInfo.content,
      shortDescription: postWithDbExtendedLikesInfo.shortDescription,
      blogId: postWithDbExtendedLikesInfo.blogId,
      id: postWithDbExtendedLikesInfo._id,
      blogName: postWithDbExtendedLikesInfo.blogName,
      extendedLikesInfo: {
        likesCount:
          postWithDbExtendedLikesInfo.extendedLikesInfo.likesCount || 0,
        dislikesCount:
          postWithDbExtendedLikesInfo.extendedLikesInfo.dislikesCount || 0,
        newestLikes: newestLikes || [],
        myStatus: postStatusByUser || LIKE_STATUS.None,
      },
    };

    return postViewModel;
  }

  _getPostWithBlogNameAggregate = (match?: any): PipelineStage[] => {
    return [
      { $match: match },
      {
        $lookup: {
          from: 'blogs',
          localField: 'blogId',
          foreignField: '_id',
          as: 'blogInfo',
        },
      },
      {
        $unwind: '$blogInfo',
      },
      {
        $project: {
          _id: 1,
          content: 1,
          title: 1,
          shortDescription: 1,
          blogId: 1,
          createdAt: 1,
          extendedLikesInfo: 1,
          blogName: '$blogInfo.name',
        },
      },
    ];
  };
}
