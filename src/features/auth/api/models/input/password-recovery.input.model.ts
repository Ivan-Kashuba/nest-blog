import { Matches } from 'class-validator';
import { EMAIL_REGEX } from '../../../../../shared/regex/regex';

export class PasswordRecoveryInputModel {
  @Matches(EMAIL_REGEX, { message: "Doesn't suite regex schema" })
  email: string;
}
