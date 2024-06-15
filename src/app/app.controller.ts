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
    return await this.usersRowSqlRepository.findUserByLoginOrEmail(
      queryParams.search || '',
    );
  }
}
