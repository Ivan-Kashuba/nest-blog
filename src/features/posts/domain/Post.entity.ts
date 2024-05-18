import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ExtendedLikes,
  ExtendedLikesSchema,
} from '../../likes/domain/ExtendedLikes.entity';
import { LIKE_STATUS } from '../../likes/domain/like.type';

@Schema({ timestamps: { createdAt: true } })
export class Post {
  _id: Types.ObjectId;
  createdAt: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  blogId: Types.ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop({ type: ExtendedLikesSchema })
  extendedLikesInfo: ExtendedLikes;

  async like(likeStatus: LIKE_STATUS, userId: Types.ObjectId, login: string) {
    const that = this as unknown as TPostDocument;

    if (!Object.values(LIKE_STATUS).includes(likeStatus))
      throw new Error('Not valid likeStatus');

    const userLikeIndex = that.extendedLikesInfo.extendedLikes.findIndex(
      (like) => like.userId === userId,
    );

    const extendedLikesInfo =
      that.extendedLikesInfo?.extendedLikes[userLikeIndex];

    const previousLikeStatus = extendedLikesInfo?.status || LIKE_STATUS.None;

    if (userLikeIndex !== -1) {
      extendedLikesInfo.status = likeStatus;

      if (
        likeStatus === LIKE_STATUS.Like &&
        !extendedLikesInfo?.firstLikeDate
      ) {
        extendedLikesInfo.firstLikeDate = new Date().toISOString();
      }
    } else {
      that.extendedLikesInfo.extendedLikes.push({
        status: likeStatus,
        userId,
        userLogin: login,
        addedAt: new Date().toISOString(),
        firstLikeDate:
          likeStatus === LIKE_STATUS.Like ? new Date().toISOString() : null,
      });
    }
    reCountLikes(previousLikeStatus);

    function reCountLikes(previousLikeStatus: LIKE_STATUS) {
      if (previousLikeStatus === LIKE_STATUS.Like) {
        that.extendedLikesInfo.likesCount -= 1;
      }

      if (previousLikeStatus === LIKE_STATUS.Dislike) {
        that.extendedLikesInfo.dislikesCount -= 1;
      }

      if (likeStatus === LIKE_STATUS.Like) {
        that.extendedLikesInfo.likesCount += 1;
      }

      if (likeStatus === LIKE_STATUS.Dislike) {
        that.extendedLikesInfo.dislikesCount += 1;
      }
    }
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

const PostMethods = {
  like: Post.prototype.like,
};

PostSchema.methods = PostMethods;

export type TPostMethods = typeof PostMethods;
export type TPostDocument = HydratedDocument<Post> & TPostMethods;
export type TPostModel = Model<Post>;
