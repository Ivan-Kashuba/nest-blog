import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersMongoQueryRepository } from '../infrastructure/users-mongo-query.repository';
import {
  PaginationPayload,
  WithPagination,
} from '../../../infrastructure/pagination/types/pagination.types';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import { UserCreateModel } from './models/input/create-user.input.model';
import { TUserDocument } from '../domain/User.entity';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from './models/output/user.output.model';
import { ValidateObjectIdPipe } from '../../../infrastructure/pipes/object-id.pipe';
import { AdminAuthGuard } from '../../../infrastructure/guards/admin-auth.guard';

@UseGuards(AdminAuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersMongoQueryRepository,
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ValidateObjectIdPipe) id: string) {
    const isUserDeleted = await this.usersService.deleteUser(id);

    if (!isUserDeleted) {
      throw new NotFoundException();
    }
  }
}
