import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, TBlogModel } from '../domain/Blog.entity';
import { BlogInputModel } from '../api/models/input/create-blog.input.model';
import { Types } from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,

    @InjectModel(Blog.name) private BlogModel: TBlogModel,
  ) {}

  async createBlog(blog: BlogInputModel) {
    const { name, websiteUrl, description } = blog;

    const newBlog = new this.BlogModel({ name, websiteUrl, description });

    await this.blogsRepository.save(newBlog);

    return newBlog;
  }

  async deleteBlog(blogId: string) {
    const deleteResult = await this.BlogModel.deleteOne({ _id: blogId });

    return deleteResult.deletedCount === 1;
  }

  async updateBlog(blogId: Types.ObjectId, updateInfo: BlogInputModel) {
    const blog = await this.blogsRepository.findBlogById(blogId);

    if (!blog) {
      return false;
    }

    blog.set(updateInfo);

    await this.blogsRepository.save(blog);
    return true;
  }
}
