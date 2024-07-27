import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Post, TPostDocument, TPostModel } from '../domain/Post.entity';

@Injectable()
export class PostsMongoRepository {
  constructor(@InjectModel(Post.name) private PostModel: TPostModel) {}

  async findPostById(postId: Types.ObjectId) {
    return this.PostModel.findOne({ _id: new Types.ObjectId(postId) });
  }

  async save(post: TPostDocument) {
    await post.save();
  }
}
