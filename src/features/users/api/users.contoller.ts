import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import {
  PaginationPayload,
  WithPagination,
} from '../../../common/pagination/types/pagination.types';
import { PaginationService } from '../../../common/pagination/service/pagination.service';
import { UserCreateModel } from './models/input/create-user.input.model';
import { TUserDocument } from '../domain/user.entity';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from './models/output/user.output.model';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly paginationService: PaginationService,
  ) {}

  @Get()
  async getUsers(
    @Query()
    queryParams: {
      searchLoginTerm?: string;
      searchEmailTerm?: string;
    } & Partial<PaginationPayload<UserOutputModel>>,
  ): Promise<WithPagination<UserOutputModel>> {
    const pagination = this.paginationService.validatePayloadPagination(
      queryParams,
      'createdAt',
    );

    return await this.usersQueryRepository.findUsers(
      pagination,
      queryParams.searchLoginTerm || null,
      queryParams.searchEmailTerm || null,
    );
  }

  @Post()
  async createUser(@Body() userCreateModel: UserCreateModel) {
    const userDocument: TUserDocument =
      await this.usersService.createUser(userCreateModel);

    return UserOutputModelMapper(userDocument);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string): string {
    return this.usersService.deleteUser(id);
  }
}
