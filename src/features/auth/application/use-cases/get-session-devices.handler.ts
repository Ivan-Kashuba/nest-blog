import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IsNotEmpty, Length, validateOrReject } from 'class-validator';
import { Types } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  TCommentModel,
} from '../../../comments/domain/Comment.entity';
import { JwtService } from '../../../../application/jwt.service';
import { UnauthorizedException } from '@nestjs/common';
import { SecurityQueryRepository } from '../../infrastructure/security.query.repository';

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
