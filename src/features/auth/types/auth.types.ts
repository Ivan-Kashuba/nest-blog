import { Types } from 'mongoose';

export type UserTokenInfo = {
  email: string;
  login: string;
  userId: Types.ObjectId;
  deviceId: Types.ObjectId | string;
};
