import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from '../features/users/api/users.contoller';
import { UsersService } from '../features/users/application/users.service';
import { UsersRepository } from '../features/users/infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../features/users/domain/user.entity';
import { UsersQueryRepository } from '../features/users/infrastructure/users.query.repository';
import { PaginationService } from '../common/pagination/service/pagination.service';
import { TestingController } from '../features/testing/api/testing.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017', { dbName: 'local-db' }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AppController, TestingController, UsersController],
  providers: [
    AppService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    PaginationService,
  ],
})
export class AppModule {}
