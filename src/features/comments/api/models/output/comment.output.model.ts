import { LikeViewModel } from '../../../../likes/api/models/output/like.output.model';
import { Types } from 'mongoose';

export class CommentOutputModel {
  id: Types.ObjectId;
  content: string;
  commentatorInfo: TCommentatorInfo;
  createdAt: string;
  likesInfo: LikeViewModel;
}

export type TCommentatorInfo = {
  userId: Types.ObjectId;
  userLogin: string;
};
