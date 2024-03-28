import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TCommentatorInfo } from '../api/models/output/comment.output.model';
import { Like } from '../../likes/domain/Like.entity';

@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;
  @Prop({ required: true, type: String })
  userLogin: string;
}

@Schema()
export class Comment {
  _id: Types.ObjectId;
  @Prop({ required: true })
  postId: Types.ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true, type: CommentatorInfo })
  commentatorInfo: TCommentatorInfo;
  @Prop({ default: new Date().toISOString() })
  createdAt: string;
  @Prop({ type: [Like] })
  likes: Like[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export type TCommentDocument = HydratedDocument<Comment>;
export type TCommentModel = Model<Comment>;
