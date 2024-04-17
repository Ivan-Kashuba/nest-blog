import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TUserModel, User } from '../../users/domain/User.entity';
import { Blog, TBlogModel } from '../../blogs/domain/Blog.entity';
import { Post, TPostModel } from '../../posts/domain/Post.entity';
import { Comment, TCommentModel } from '../../comments/domain/Comment.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name) private UserModel: TUserModel,
    @InjectModel(Blog.name) private BlogModel: TBlogModel,
    @InjectModel(Post.name) private PostModel: TPostModel,
    @InjectModel(Comment.name) private CommentModel: TCommentModel,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser() {
    await this.UserModel.deleteMany({});
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.CommentModel.deleteMany({});
  }
}
