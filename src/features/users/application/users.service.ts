import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserCreateModel } from '../api/models/input/create-user.input.model';
import { validateOrRejectModel } from '../../../infrastructure/errors/validateOrRejectModel';
import { UsersRepository } from '../infrastructure/abstract-users.repository';
import { RepositoryName } from '../../../config/repository-config';
import bcrypt from 'bcryptjs';
import { ResultService } from '../../../infrastructure/resultService/ResultService';

@Injectable()
export class UsersService {
  constructor(
    @Inject(RepositoryName.UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async createUser(userPayload: UserCreateModel): Promise<string> {
    await validateOrRejectModel(userPayload, UserCreateModel);

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(userPayload.password, salt);

    const isLoginExists = await this.usersRepository.findUserByLoginOrEmail(
      userPayload.login,
    );

    const isEmailExists = await this.usersRepository.findUserByLoginOrEmail(
      userPayload.email,
    );

    if (isLoginExists) {
      throw new BadRequestException(
        ResultService.createError('login', 'Login is already in use'),
      );
    }

    if (isEmailExists) {
      throw new BadRequestException(
        ResultService.createError('email', 'Email is already in use'),
      );
    }

    const userId = await this.usersRepository.createUser(
      userPayload,
      salt,
      hash,
    );

    return userId.toString();
  }

  deleteUser(id: string) {
    return this.usersRepository.deleteUser(id);
  }
}
