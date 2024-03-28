import { LIKE_STATUS } from '../../../domain/like.type';
import { Types } from 'mongoose';

export class ExtendedLikesViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LIKE_STATUS;
  newestLikes: NewestLikeViewModel[];
}

export class NewestLikeViewModel {
  addedAt: string;
  userId: Types.ObjectId;
  login: string;
}
