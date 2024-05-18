import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import { Types } from 'mongoose';
import {
  Comment,
  TCommentDocument,
  TCommentModel,
} from '../domain/Comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: TCommentModel,
    private readonly paginationService: PaginationService,
  ) {}

  async findCommentById(commentId: Types.ObjectId) {
    const comment: TCommentDocument | null = await this.CommentModel.findOne({
      _id: commentId,
    });

    return comment;
  }

  async save(comment: TCommentDocument) {
    await comment.save();
  }
}
