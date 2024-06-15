import { Injectable } from '@nestjs/common';
import { TUserDocument, TUserModel, User } from '../domain/User.entity';
import { PaginationPayload } from '../../../infrastructure/pagination/types/pagination.types';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from '../api/models/output/user.output.model';
import { Types } from 'mongoose';
import { UsersQueryRepository } from './abstract-users-query.repository';

@Injectable()
export class UsersQueryMongoRepository implements UsersQueryRepository {
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

  async findUserById(id: string): Promise<UserOutputModel | null> {
    const user: TUserDocument | null = await this.UserModel.findOne({
      _id: new Types.ObjectId(id),
    });

    return user ? UserOutputModelMapper(user) : null;
  }

  _mapDbUsersToViewUsers(dbUsers: User[]) {
    return dbUsers.map(UserOutputModelMapper);
  }
}
