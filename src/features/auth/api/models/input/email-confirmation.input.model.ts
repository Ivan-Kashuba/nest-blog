import { IsNotEmpty } from 'class-validator';
import { Trim } from '../../../../../infrastructure/decorators/transform/trim';

export class EmailConfirmationInputModel {
  @Trim()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;
}
