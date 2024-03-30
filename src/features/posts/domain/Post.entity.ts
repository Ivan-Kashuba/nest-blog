import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ExtendedLikes,
  ExtendedLikesSchema,
} from '../../likes/domain/ExtendedLikes.entity';

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
  @Prop({ type: [ExtendedLikesSchema] })
  extendedLikesInfo: ExtendedLikes;
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type TPostDocument = HydratedDocument<Post>;
export type TPostModel = Model<Post>;
