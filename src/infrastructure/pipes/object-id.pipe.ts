import { Types } from 'mongoose';
import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { envConfig } from '../../config/env-config';
import { RepositoryVariant } from '../../config/repository-config';
import { validate } from 'uuid';

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (
      envConfig.REPOSITORY === RepositoryVariant.Mongo &&
      !Types.ObjectId.isValid(value)
    ) {
      throw new NotFoundException('Invalid ObjectId');
    }

    if (envConfig.REPOSITORY !== RepositoryVariant.Mongo && !validate(value)) {
      throw new NotFoundException('Invalid Uuid');
    }

    return value;
  }
}
