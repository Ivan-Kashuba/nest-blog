import { HydratedDocument, Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Session {
  _id: Types.ObjectId;
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  lastActiveDate: string;
  @Prop({ required: true })
  deviceId: Types.ObjectId;
  @Prop({ required: true })
  userId: Types.ObjectId;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

export type TSessionDocument = HydratedDocument<Session>;
export type TSessionModel = Model<Session>;
