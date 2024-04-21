import { Length } from 'class-validator';
import {
  LoginValid,
  UserEmailValid,
} from '../../../../../infrastructure/decorators/validation/user-login';

export class UserCreateModel {
  @LoginValid(false)
  login: string;
  @UserEmailValid(false)
  email: string;
  @Length(6, 20)
  password: string;
}
