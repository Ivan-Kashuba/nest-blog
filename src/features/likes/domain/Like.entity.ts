import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LIKE_STATUS } from './like.type';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class Like {
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true, enum: LIKE_STATUS })
  status: LIKE_STATUS;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
