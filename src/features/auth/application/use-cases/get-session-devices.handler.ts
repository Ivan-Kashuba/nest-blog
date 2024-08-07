import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IsNotEmpty, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { JwtService } from '../../../../application/jwt.service';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { SecurityMongoQueryRepository } from '../../infrastructure/security-mongo-query.repository';
import { RepositoryName } from '../../../../config/repository-config';
import { SecurityQueryRepository } from '../../infrastructure/abstract-security-query.repository';

export class GetSessionDevicesCommand {
  @IsNotEmpty()
  refreshTokenFromCookie: string;

  constructor(data: GetSessionDevicesCommand) {
    Object.assign(this, plainToClass(GetSessionDevicesCommand, data));
  }
}

@CommandHandler(GetSessionDevicesCommand)
export class GetSessionDevicesHandler
  implements ICommandHandler<GetSessionDevicesCommand>
{
  constructor(
    private jwtService: JwtService,
    @Inject(RepositoryName.SecurityQueryRepository)
    private securityQueryRepository: SecurityQueryRepository,
  ) {}

  async execute(command: GetSessionDevicesCommand) {
    await validateOrReject(command);

    const { refreshTokenFromCookie } = command;

    const user = await this.jwtService.getUserInfoByToken(
      refreshTokenFromCookie,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const userSessions =
      await this.securityQueryRepository.getUserSessionsListById(user.userId);

    return userSessions;
  }
}
