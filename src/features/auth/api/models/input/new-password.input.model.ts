import { Trim } from '../../../../../infrastructure/decorators/transform/trim';
import { IsNotEmpty, Length } from 'class-validator';

export class NewPasswordInputModel {
  @Trim()
  @Length(6, 20)
  newPassword: string;
  @Trim()
  @IsNotEmpty({ message: 'Code is required' })
  recoveryCode: string;
}
