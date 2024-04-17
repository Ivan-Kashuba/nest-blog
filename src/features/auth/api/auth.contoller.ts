import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../../../application/jwt.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { LoginInputModel } from './models/input/login.input.model';
import { AuthService } from '../application/auth.service';
import { Request, Response } from 'express';
import { UserCreateModel } from '../../users/api/models/input/create-user.input.model';
import { EmailManager } from '../../../adapters/email.manager';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
    private readonly emailManager: EmailManager,
  ) {}

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
}
