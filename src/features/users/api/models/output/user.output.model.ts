import { TUserDocument } from '../../../domain/user.entity';
import { TUserDbModel } from '../../../domain/user.type';

export class UserOutputModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

// MAPPERS
export const UserOutputModelMapper = (
  user: TUserDbModel | TUserDocument,
): UserOutputModel => {
  const outputModel = new UserOutputModel();

  outputModel.id = user._id!.toString();
  outputModel.login = user.accountData.login;
  outputModel.email = user.accountData.email;
  outputModel.createdAt = user.accountData.createdAt;

  return outputModel;
};
