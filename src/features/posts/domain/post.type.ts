import { Types } from 'mongoose';
import { Post } from './Post.entity';
import { PostOutputModel } from '../api/models/output/post.output.model';

export type PostModelAfterAggregation = Omit<
  PostOutputModel,
  'extendedLikesInfo'
> & { _id: Types.ObjectId } & Pick<Post, 'extendedLikesInfo'>;
