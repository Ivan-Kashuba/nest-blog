import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, Length, Matches } from 'class-validator';
import { IsUserLoginOrEmailUnused } from './is-user-login-available';
import { EMAIL_REGEX, LOGIN_REGEX } from '../../../shared/regex/regex';

export const IsLoginValid = () =>
  applyDecorators(
    Length(3, 10),
    Matches(LOGIN_REGEX, { message: "Doesn't suite regex schema" }),
    IsUserLoginOrEmailUnused(),
  );

export const isUserEmailValid = () =>
  applyDecorators(
    IsNotEmpty(),
    Matches(EMAIL_REGEX, { message: "Doesn't suite regex schema" }),
    IsUserLoginOrEmailUnused(),
  );
