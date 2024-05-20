import { Length, Matches } from 'class-validator';
import { Trim } from '../../../../../infrastructure/decorators/transform/trim';
import { URL_REGEX } from '../../../../../shared/regex/regex';

export class BlogInputModel {
  @Trim()
  @Length(1, 15)
  name: string;
  @Trim()
  @Length(1, 500)
  description: string;
  @Trim()
  @Length(1, 100)
  @Matches(URL_REGEX)
  websiteUrl: string;
}
