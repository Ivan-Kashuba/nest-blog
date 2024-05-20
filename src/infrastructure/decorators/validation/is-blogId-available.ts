import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../../features/blogs/infrastructure/blogs.repository';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'IsBlogIdExists', async: true })
@Injectable()
export class IsBlogIdExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async validate(blogId: Types.ObjectId, args: ValidationArguments) {
    const isValidObjectId = Types.ObjectId.isValid(blogId);

    if (!isValidObjectId) return false;

    const blog = await this.blogsRepository.findBlogById(blogId);

    return !!blog;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Blog is not found';
  }
}

export function IsBlogIdExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBlogIdExistsConstraint,
    });
  };
}
