import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { Cookies } from '../../../infrastructure/decorators/transform/cookies';
import { CommandBus } from '@nestjs/cqrs';
import { GetSessionDevicesCommand } from '../application/use-cases/get-session-devices.handler';
import { RemoveAllButCurrentSessionCommand } from '../application/use-cases/remove-all-but-current-sessions.handler';
import { ValidateObjectIdPipe } from '../../../infrastructure/pipes/object-id.pipe';
import { Types } from 'mongoose';
import { RemoveSessionByIdCommand } from '../application/use-cases/remove-session-by-id.handler';

@Controller('security')
export class SecurityController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('devices')
  async getDevices(@Cookies('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const getDevicesCommand = new GetSessionDevicesCommand({
      refreshTokenFromCookie: refreshToken,
    });

    const result = await this.commandBus.execute(getDevicesCommand);

    return result;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('devices')
  async deleteAllButCurrentSessions(
    @Cookies('refreshToken') refreshToken: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const removeOtherSessionsCommand = new RemoveAllButCurrentSessionCommand({
      refreshTokenFromCookie: refreshToken,
    });

    return await this.commandBus.execute(removeOtherSessionsCommand);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('devices/:deviceId')
  async deleteSessionById(
    @Cookies('refreshToken') refreshToken: string,
    @Param('deviceId', ValidateObjectIdPipe) deviceId: Types.ObjectId,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const removeOtherSessionsCommand = new RemoveSessionByIdCommand({
      refreshTokenFromCookie: refreshToken,
      deviceId,
    });

    return await this.commandBus.execute(removeOtherSessionsCommand);
  }
}
