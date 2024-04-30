import { IsEmail, IsNotEmpty } from 'class-validator';
import { Trim } from '../../../../../infrastructure/decorators/transform/trim';

export class EmailResendingInputModel {
  @IsNotEmpty()
  @Trim()
  @IsEmail()
  email: string;
}
