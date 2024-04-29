import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginInputModel } from './models/input/login.input.model';
import { AuthService } from '../application/auth.service';
import { Request, Response } from 'express';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { EmailResendingInputModel } from './models/input/email-resending.input.model';
import { EmailConfirmationInputModel } from './models/input/email-confirmation.input.model';
import { User } from '../../../infrastructure/decorators/transform/get-user';
import { UserTokenInfo } from '../types/auth.types';
import { UserAuthGuard } from '../../../infrastructure/guards/user-auth.guard';
import { Cookies } from '../../../infrastructure/decorators/transform/cookies';
import { PasswordRecoveryInputModel } from './models/input/password-recovery.input.model';
import { NewPasswordInputModel } from './models/input/new-password.input.model';
import { ResultService } from '../../../infrastructure/resultService/ResultService';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginInputModel: LoginInputModel,
    @Ip() userIp: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userDeviceName = req.headers['user-agent'] || 'Unknown';

    const tokens = await this.authService.loginByLoginOrEmail(
      loginInputModel,
      userDeviceName,
      userIp as string,
    );

    if (!tokens?.accessToken || !tokens.refreshToken) {
      throw new UnauthorizedException();
    }

    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .status(HttpStatus.OK)
      .send({
        accessToken: tokens.accessToken,
      });
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() userCreateModel: UserCreateModel) {
    const createdUserId = await this.authService.registerUser(userCreateModel);

    if (!createdUserId) {
      throw new UnauthorizedException();
    }
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(@Body() { email }: EmailResendingInputModel) {
    await this.authService.resendRegistrationCode(email);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailConfirmation(
    @Body() { code }: EmailConfirmationInputModel,
  ) {
    await this.authService.confirmRegistrationCode(code);
  }

  @UseGuards(UserAuthGuard)
  @Get('me')
  async me(@User() user: UserTokenInfo) {
    return {
      email: user.email,
      login: user.login,
      userId: user.userId,
    };
  }

  @Post('refresh-token')
  async refreshToken(
    @Cookies('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const keysPair = await this.authService.refreshToken(refreshToken);

    if (!keysPair) {
      throw new UnauthorizedException();
    }

    res
      .status(HttpStatus.OK)
      .cookie('refreshToken', keysPair.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .send({
        accessToken: keysPair.accessToken,
      });
  }

  @UseGuards(UserAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @User() user: UserTokenInfo,
    @Cookies('refreshToken') refreshToken: string,
  ) {
    const isLogout = await this.authService.logout(user.userId, refreshToken);

    if (!isLogout) {
      throw new UnauthorizedException();
    }
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() { email }: PasswordRecoveryInputModel) {
    await this.authService.recoveryPassword(email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(
    @Body() { newPassword, recoveryCode }: NewPasswordInputModel,
  ) {
    const isUpdated = await this.authService.setNewPasswordForUserByCode(
      recoveryCode,
      newPassword,
    );

    if (!isUpdated) {
      throw new BadRequestException(
        ResultService.createError(
          'recoveryCode',
          'Code is expired or not found',
        ),
      );
    }
  }
}
