import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RepositoryName } from '../config/repository-config';
import { SecurityQueryRepository } from '../features/auth/infrastructure/abstract-security-query.repository';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(RepositoryName.SecurityQueryRepository)
    private readonly securityQueryRepository: SecurityQueryRepository,
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
    return await this.securityQueryRepository.getUserSessionsListById(
      '268511d3-4f5c-4444-b432-c2aa6659076c',
    );
  }
}
