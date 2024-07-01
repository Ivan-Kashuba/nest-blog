import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RepositoryName } from '../config/repository-config';
import { UsersRowSqlRepository } from '../features/users/infrastructure/users-rowSql.repository';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(RepositoryName.UsersRepository)
    private readonly usersRowSqlRepository: UsersRowSqlRepository,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  async getUserById(
    @Query()
    queryParams: {
      search?: string;
    },
  ) {
    await this.usersRowSqlRepository.updateUserPassword(
      '57c31731-1db8-45b4-bdba-f7e6b2901403',
      'SALT123',
      'HASH-1',
    );

    return 'OK';
  }
}
