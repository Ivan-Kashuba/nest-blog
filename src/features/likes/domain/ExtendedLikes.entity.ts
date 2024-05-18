import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LIKE_STATUS } from './like.type';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class ExtendedLike {
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true, enum: LIKE_STATUS })
  status: LIKE_STATUS;
  @Prop({ type: String, default: new Date().toISOString })
  addedAt: string;
  @Prop({ type: String || null, default: null })
  firstLikeDate: string | null;
  @Prop({ required: true })
  userLogin: string;
}

@Schema({ _id: false })
export class ExtendedLikes {
  @Prop({ required: true })
  likesCount: number;
  @Prop({ required: true })
  dislikesCount: number;
  @Prop({ type: [ExtendedLike] })
  extendedLikes: ExtendedLike[];
}

export const ExtendedLikesSchema = SchemaFactory.createForClass(ExtendedLikes);
