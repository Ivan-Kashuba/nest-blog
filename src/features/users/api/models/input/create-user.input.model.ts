import { Length } from 'class-validator';
import {
  IsLoginValid,
  isUserEmailValid,
} from '../../../../../infrastructure/decorators/validation/user-login';

export class UserCreateModel {
  @IsLoginValid()
  login: string;
  @isUserEmailValid()
  email: string;
  @Length(6, 20)
  password: string;
}
