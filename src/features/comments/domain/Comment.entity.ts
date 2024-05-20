import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TCommentatorInfo } from '../api/models/output/comment.output.model';
import { Like } from '../../likes/domain/Like.entity';
import { LIKE_STATUS } from '../../likes/domain/like.type';

@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;
  @Prop({ required: true, type: String })
  userLogin: string;
}

@Schema({ timestamps: { createdAt: true } })
export class Comment {
  _id: Types.ObjectId;
  createdAt: string;
  @Prop({ required: true })
  postId: Types.ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true, type: CommentatorInfo })
  commentatorInfo: TCommentatorInfo;
  @Prop({ type: [Like] })
  likes: Like[];

  async like(likeStatus: LIKE_STATUS, userId: Types.ObjectId) {
    const existingLikeIndex = this.likes.findIndex(
      (like) => like.userId === userId,
    );

    const isLikeStatusAlreadyExists =
      existingLikeIndex !== undefined && existingLikeIndex !== -1;

    if (isLikeStatusAlreadyExists && likeStatus === LIKE_STATUS.None) {
      this.likes = this.likes.filter((likeInfo) => likeInfo.userId !== userId);
      return;
    }

    if (!isLikeStatusAlreadyExists && likeStatus === LIKE_STATUS.None) {
      return;
    }

    if (isLikeStatusAlreadyExists) {
      this.likes[existingLikeIndex].status = likeStatus;
    } else {
      this.likes.push({ status: likeStatus, userId });
    }
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

const CommentMethods = {
  like: Comment.prototype.like,
};

CommentSchema.methods = CommentMethods;

export type TCommentMethods = typeof CommentMethods;
export type TCommentDocument = HydratedDocument<Comment> & TCommentMethods;
export type TCommentModel = Model<Comment>;
