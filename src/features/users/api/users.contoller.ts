import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import {
  PaginationPayload,
  WithPagination,
} from '../../../infrastructure/pagination/types/pagination.types';
import { PaginationService } from '../../../infrastructure/pagination/service/pagination.service';
import { UserCreateModel } from './models/input/create-user.input.model';
import { UserOutputModel } from './models/output/user.output.model';
import { ValidateObjectIdPipe } from '../../../infrastructure/pipes/object-id.pipe';
import { AdminAuthGuard } from '../../../infrastructure/guards/admin-auth.guard';
import { RepositoryName } from '../../../config/repository-config';
import { UsersQueryRepository } from '../infrastructure/abstract-users-query.repository';

@UseGuards(AdminAuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(RepositoryName.UsersQueryRepository)
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
    const userId: string = await this.usersService.createUser(userCreateModel);

    return await this.usersQueryRepository.findUserById(userId);
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
