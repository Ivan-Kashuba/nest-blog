import { Trim } from '../../../../../infrastructure/decorators/transform/trim';
import { Length } from 'class-validator';

export class PostForBlogInputModel {
  @Trim()
  @Length(1, 30)
  title: string;
  @Trim()
  @Length(1, 100)
  shortDescription: string;
  @Trim()
  @Length(1, 1000)
  content: string;
}
