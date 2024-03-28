import { Blog, TBlogDocument } from '../../../domain/Blog.entity';

export class BlogOutputModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

// MAPPERS
export const BlogOutputModelMapper = (
  blog: Blog | TBlogDocument,
): BlogOutputModel => {
  const outputModel = new BlogOutputModel();

  outputModel.id = blog._id!.toString();
  outputModel.createdAt = blog.createdAt;
  outputModel.description = blog.description;
  outputModel.isMembership = blog.isMembership;
  outputModel.websiteUrl = blog.websiteUrl;
  outputModel.name = blog.name;

  return outputModel;
};
