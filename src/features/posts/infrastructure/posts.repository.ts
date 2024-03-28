import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Post, TPostDocument, TPostModel } from '../domain/Post.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: TPostModel) {}

  async findPostById(postId: Types.ObjectId) {
    return this.PostModel.findOne({ _id: postId });
  }

  async save(post: TPostDocument) {
    await post.save();
  }
}
