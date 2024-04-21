import { UserLoginOrEmailExists } from '../../../../../infrastructure/decorators/validation/is-user-login-available';

export class EmailResendingInputModel {
  @UserLoginOrEmailExists(true, { message: 'User is not found' })
  email: string;
}
