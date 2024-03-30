import { Injectable } from '@nestjs/common';
import { TUserDocument, TUserModel, User } from '../domain/User.entity';
import { PaginationPayload } from '../../../common/pagination/types/pagination.types';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationService } from '../../../common/pagination/service/pagination.service';
import { UserOutputModel } from '../api/models/output/user.output.model';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private UserModel: TUserModel,
    private readonly paginationService: PaginationService,
  ) {}

  async findUsers(
    pagination: PaginationPayload<UserOutputModel>,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;
    const termsArray: Record<string, RegExp>[] = [];

    if (searchLoginTerm) {
      termsArray.push({
        'accountData.login':
          this.paginationService.getInsensitiveCaseSearchRegexString(
            searchLoginTerm,
          ),
      });
    }

    if (searchEmailTerm) {
      termsArray.push({
        'accountData.email':
          this.paginationService.getInsensitiveCaseSearchRegexString(
            searchEmailTerm,
          ),
      });
    }

    const filters = termsArray.length ? { $or: termsArray } : {};

    const totalCount = await this.UserModel.countDocuments(filters);

    const foundedUsers: User[] = await this.UserModel.find(filters)
      .sort({
        [`accountData.${sortBy}`]:
          this.paginationService.getSortDirectionMongoValue(sortDirection),
      })
      .skip(this.paginationService.getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize)
      .lean();

    return this.paginationService.createPaginationResponse<UserOutputModel>(
      pagination,
      this._mapDbUsersToViewUsers(foundedUsers),
      totalCount,
    );
  }

  _mapDbUserToViewUser(dbUser: User | TUserDocument) {
    const viewUser: UserOutputModel = {
      id: dbUser._id!.toString(),
      createdAt: dbUser.accountData.createdAt,
      email: dbUser.accountData.email,
      login: dbUser.accountData.login,
    };

    return viewUser;
  }

  _mapDbUsersToViewUsers(dbUsers: User[]) {
    return dbUsers.map(this._mapDbUserToViewUser);
  }
}
