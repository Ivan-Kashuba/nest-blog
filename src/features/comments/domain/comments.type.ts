import { Types } from 'mongoose';

import { Post } from '../../posts/domain/Post.entity';
import { PostOutputModel } from '../../posts/api/models/output/post.output.model';

export type PostModelAfterAggregation = Omit<
  PostOutputModel,
  'extendedLikesInfo'
> & { _id: Types.ObjectId } & Pick<Post, 'extendedLikesInfo'>;
