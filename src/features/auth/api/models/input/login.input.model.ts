import { IsNotEmpty } from 'class-validator';

export class LoginInputModel {
  @IsNotEmpty()
  loginOrEmail: string;
  @IsNotEmpty()
  password: string;
}
