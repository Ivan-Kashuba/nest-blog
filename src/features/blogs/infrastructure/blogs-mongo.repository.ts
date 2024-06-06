import { Injectable } from '@nestjs/common';
import { Blog, TBlogDocument, TBlogModel } from '../domain/Blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Injectable()
export class BlogsMongoRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: TBlogModel) {}

  async findBlogById(blogId: Types.ObjectId) {
    return this.BlogModel.findOne({ _id: blogId });
  }

  async save(blog: TBlogDocument) {
    await blog.save();
  }
}
