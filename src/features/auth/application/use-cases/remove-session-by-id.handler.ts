import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IsNotEmpty, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { JwtService } from '../../../../application/jwt.service';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthRepository } from '../../infrastructure/auth.repository';
import { Types } from 'mongoose';

export class RemoveSessionByIdCommand {
  @IsNotEmpty()
  refreshTokenFromCookie: string;
  @IsNotEmpty()
  deviceId: Types.ObjectId;

  constructor(data: RemoveSessionByIdCommand) {
    Object.assign(this, plainToClass(RemoveSessionByIdCommand, data));
  }
}

@CommandHandler(RemoveSessionByIdCommand)
export class RemoveSessionByIdHandler
  implements ICommandHandler<RemoveSessionByIdCommand>
{
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private authRepository: AuthRepository,
  ) {}

  async execute(command: RemoveSessionByIdCommand) {
    await validateOrReject(command);

    const { refreshTokenFromCookie, deviceId } = command;

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

    const sessionToRemove =
      await this.authRepository.getSessionByDeviceId(deviceId);

    if (!sessionToRemove) {
      throw new NotFoundException();
    }

    console.log('sessionToRemove.userId:', sessionToRemove.userId);
    console.log('user.userId:', user.userId);
    console.log('user:', user);
    console.log('sessionToRemove:', sessionToRemove);

    const isSessionBelongToUser =
      sessionToRemove.userId.toString() === user.userId.toString();

    if (!isSessionBelongToUser) {
      throw new ForbiddenException();
    }

    await this.authRepository.removeUserSession(
      // user.userId,
      sessionToRemove._id,
    );
  }
}
