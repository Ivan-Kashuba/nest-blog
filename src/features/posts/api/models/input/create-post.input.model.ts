import { Types } from 'mongoose';

export class PostInputModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: Types.ObjectId;
}
