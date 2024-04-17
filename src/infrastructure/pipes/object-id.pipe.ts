import { Types } from 'mongoose';
import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateObjectIdPipe
  implements PipeTransform<string, Types.ObjectId>
{
  transform(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new NotFoundException('Invalid ObjectId');
    }

    return new Types.ObjectId(value);
  }
}
