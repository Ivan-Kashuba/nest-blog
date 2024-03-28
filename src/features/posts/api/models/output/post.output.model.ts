import { ExtendedLikesViewModel } from '../../../../likes/api/models/output/extended-like.input.model';
import { Types } from 'mongoose';

export class PostOutputModel {
  id: Types.ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesViewModel;
}
