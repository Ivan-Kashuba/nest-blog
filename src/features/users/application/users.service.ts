import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { TUserDocument, TUserModel, User } from '../domain/user.entity';
import { UserCreateModel } from '../api/models/input/create-user.input.model';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,

    @InjectModel(User.name) private UserModel: TUserModel,
  ) {}

  async createUser(userPayload: UserCreateModel): Promise<TUserDocument> {
    const user: TUserDocument = await this.UserModel.createUser(
      this.UserModel,
      this.usersRepository,
      userPayload,
    );

    await this.usersRepository.save(user);

    return user;
  }
  deleteUser(id: string) {
    return this.usersRepository.deleteUser(id);
  }
}