import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, Length, Matches } from 'class-validator';
import { UserLoginOrEmailExists } from './is-user-login-available';
import { EMAIL_REGEX, LOGIN_REGEX } from '../../../shared/regex/regex';

export const LoginValid = (shouldLoginExist: boolean) =>
  applyDecorators(
    Length(3, 10),
    Matches(LOGIN_REGEX, { message: "Doesn't suite regex schema" }),
    UserLoginOrEmailExists(shouldLoginExist),
  );

export const UserEmailValid = (shouldEmailExist: boolean) =>
  applyDecorators(
    IsNotEmpty(),
    Matches(EMAIL_REGEX, { message: "Doesn't suite regex schema" }),
    UserLoginOrEmailExists(shouldEmailExist),
  );
