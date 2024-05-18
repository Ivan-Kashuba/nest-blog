import { LIKE_STATUS } from '../../../domain/like.type';
import { IsEnum } from 'class-validator';

export class LikeInputModel {
  @IsEnum(LIKE_STATUS)
  likeStatus: LIKE_STATUS;
}
