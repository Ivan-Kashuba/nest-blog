import { Injectable } from '@nestjs/common';
import { PostsMongoRepository } from '../infrastructure/posts-mongo.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, TPostModel } from '../domain/Post.entity';
import { PostInputModel } from '../api/models/input/create-post.input.model';
import { Types } from 'mongoose';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsMongoRepository,
    @InjectModel(Post.name) private PostModel: TPostModel,
  ) {}

  async createPost(postInfo: PostInputModel) {
    const { blogId, shortDescription, title, content } = postInfo;

    const newPost = new this.PostModel({
      blogId: new Types.ObjectId(blogId),
      shortDescription,
      title,
      content,
      extendedLikesInfo: { extendedLikes: [], likesCount: 0, dislikesCount: 0 },
    });

    await this.postsRepository.save(newPost);

    return newPost._id;
  }

  async deletePost(postId: Types.ObjectId) {
    const deleteResult = await this.PostModel.deleteOne({ _id: postId });

    return deleteResult.deletedCount === 1;
  }

  async updatePost(postId: Types.ObjectId, updateInfo: PostInputModel) {
    const post = await this.postsRepository.findPostById(postId);

    if (!post) {
      return false;
    }

    post.set({ ...updateInfo, blogId: new Types.ObjectId(updateInfo.blogId) });

    await this.postsRepository.save(post);
    return true;
  }
}
