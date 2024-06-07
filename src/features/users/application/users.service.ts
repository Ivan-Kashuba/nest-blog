import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TUserDocument, TUserModel, User } from '../domain/User.entity';
import { UserCreateModel } from '../api/models/input/create-user.input.model';
import { validateOrRejectModel } from '../../../infrastructure/errors/validateOrRejectModel';
import { UsersRepository } from '../infrastructure/abstract-users.repository';
import { RepositoryName } from '../../../config/repository-config';

@Injectable()
export class UsersService {
  constructor(
    @Inject(RepositoryName.UsersRepository)
    private readonly usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: TUserModel,
  ) {}

  async createUser(userPayload: UserCreateModel): Promise<TUserDocument> {
    await validateOrRejectModel(userPayload, UserCreateModel);

    const user: TUserDocument | null = await this.UserModel.createUser(
      this.usersRepository,
      userPayload,
    );

    await this.usersRepository.save(user!);

    return user!;
  }
  deleteUser(id: string) {
    return this.usersRepository.deleteUser(id);
  }
}
