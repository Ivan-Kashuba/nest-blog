import { TUserDocument, User } from '../../../domain/User.entity';

export class UserOutputModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

// MAPPERS
export const UserOutputModelMapper = (
  user: User | TUserDocument,
): UserOutputModel => {
  const outputModel = new UserOutputModel();

  outputModel.id = user._id!.toString();
  outputModel.login = user.accountData.login;
  outputModel.email = user.accountData.email;
  outputModel.createdAt = user.accountData.createdAt;

  return outputModel;
};
