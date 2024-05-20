import { Types } from 'mongoose';
import { IsNotEmpty, Length } from 'class-validator';
import { Trim } from '../../../../../infrastructure/decorators/transform/trim';
import { IsBlogIdExists } from '../../../../../infrastructure/decorators/validation/is-blogId-available';

export class PostInputModel {
  @Trim()
  @Length(1, 30)
  title: string;
  @Trim()
  @Length(1, 100)
  shortDescription: string;
  @Trim()
  @Length(1, 1000)
  content: string;
  @IsNotEmpty()
  @IsBlogIdExists()
  blogId: Types.ObjectId;
}
