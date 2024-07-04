import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IsNotEmpty, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { JwtService } from '../../../../application/jwt.service';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { RepositoryName } from '../../../../config/repository-config';
import { AuthRepository } from '../../infrastructure/abstract-auth.repository';

export class RemoveAllButCurrentSessionCommand {
  @IsNotEmpty()
  refreshTokenFromCookie: string;

  constructor(data: RemoveAllButCurrentSessionCommand) {
    Object.assign(this, plainToClass(RemoveAllButCurrentSessionCommand, data));
  }
}

@CommandHandler(RemoveAllButCurrentSessionCommand)
export class RemoveAllButCurrentSessionHandler
  implements ICommandHandler<RemoveAllButCurrentSessionCommand>
{
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    @Inject(RepositoryName.AuthRepository)
    private authRepository: AuthRepository,
  ) {}

  async execute(command: RemoveAllButCurrentSessionCommand) {
    await validateOrReject(command);

    const { refreshTokenFromCookie } = command;

    const user = await this.jwtService.getUserInfoByToken(
      refreshTokenFromCookie,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const currentSession =
      await this.authService.getUserSessionByIdAndRefreshToken(
        user?.userId,
        refreshTokenFromCookie,
      );

    if (!currentSession) {
      throw new UnauthorizedException();
    }

    await this.authRepository.removeAllButCurrentUserSession(
      user.userId,
      currentSession._id,
    );
  }
}
