import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import { LIKE_STATUS } from '../../likes/domain/like.type';
import { Types } from 'mongoose';
import { Comment, TCommentModel } from '../domain/Comment.entity';
import { PaginationPayload } from '../../../infrastructure/pagination/types/pagination.types';

import { CommentOutputModel } from '../api/models/output/comment.output.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: TCommentModel,
    private readonly paginationService: PaginationService,
  ) {}

  async findCommentById(commentId: Types.ObjectId, userId?: Types.ObjectId) {
    const comment = await this.CommentModel.findOne({ _id: commentId });

    if (comment) {
      return this._mapDbCommentToViewModel(comment, userId);
    }

    return null;
  }

  async findCommentsByPostId(
    postId: Types.ObjectId,
    pagination: PaginationPayload<CommentOutputModel>,
    userId?: Types.ObjectId,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;

    const dbComments = await this.CommentModel.find({
      postId: new Types.ObjectId(postId),
    })
      .sort({
        [sortBy]:
          this.paginationService.getSortDirectionMongoValue(sortDirection),
      })
      .skip(this.paginationService.getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize);

    const totalCount = await this.CommentModel.countDocuments({
      postId: postId,
    });

    const viewComments = dbComments.map((dbComment) =>
      this._mapDbCommentToViewModel(dbComment, userId),
    );

    return this.paginationService.createPaginationResponse<CommentOutputModel>(
      pagination,
      viewComments,
      totalCount,
    );
  }

  _mapDbCommentToViewModel(
    dbComment: Comment,
    userId?: Types.ObjectId,
  ): CommentOutputModel {
    const dbLikes = dbComment.likes;

    const likesCount = dbLikes.filter(
      (like) => like.status === LIKE_STATUS.Like,
    ).length;

    const dislikesCount = dbLikes.filter(
      (like) => like.status === LIKE_STATUS.Dislike,
    ).length;

    const userLikeStatus =
      dbLikes.find((like) => like.userId === userId)?.status ||
      LIKE_STATUS.None;

    const commentViewModel: CommentOutputModel = {
      id: dbComment._id,
      commentatorInfo: dbComment.commentatorInfo,
      content: dbComment.content,
      createdAt: dbComment.createdAt,
      likesInfo: { likesCount, dislikesCount, myStatus: userLikeStatus },
    };

    return commentViewModel;
  }
}
