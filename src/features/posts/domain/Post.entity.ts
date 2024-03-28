import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ExtendedLikes,
  ExtendedLikesSchema,
} from '../../likes/domain/ExtendedLikes.entity';

@Schema()
export class Post {
  _id: Types.ObjectId;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  blogId: Types.ObjectId;
  @Prop({ default: new Date().toISOString() })
  createdAt: string;
  @Prop({ required: true })
  content: string;
  @Prop({ type: [ExtendedLikesSchema] })
  extendedLikesInfo: ExtendedLikes;
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type TPostDocument = HydratedDocument<Post>;
export type TPostModel = Model<Post>;
