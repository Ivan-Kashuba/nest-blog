import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TUserModel, User } from '../../users/domain/user.entity';

@Controller('testing')
export class TestingController {
  constructor(@InjectModel(User.name) private UserModel: TUserModel) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteUser() {
    await this.UserModel.deleteMany({});
  }
}
