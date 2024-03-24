export class TUserDbModel {
  _id?: string;
  accountData: TUserAccountData;
  accountConfirmation: TUserAccountConfirmation;
  passwordRecovery: TUserPasswordRecovery;
}

export class TUserAccountData {
  login: string;
  email: string;
  createdAt: string;
  salt: string;
  hash: string;
}

export class TUserAccountConfirmation {
  confirmationCode: string | null;
  expirationDate: string | null;
  isConfirmed: boolean;
}

export class TUserPasswordRecovery {
  confirmationCode: string | null;
  expirationDate: string | null;
}
