import { MiddlewareConsumer, Module, Provider } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from '../features/users/api/users.contoller';
import { UsersService } from '../features/users/application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../features/users/domain/User.entity';
import { UsersMongoQueryRepository } from '../features/users/infrastructure/users-mongo-query.repository';
import { PaginationService } from '../infrastructure/pagination/service/pagination.service';
import { TestingController } from '../features/testing/api/testing.controller';
import { BlogsController } from '../features/blogs/api/blogs.contoller';
import { Blog, BlogSchema } from '../features/blogs/domain/Blog.entity';
import { BlogsMongoQueryRepository } from '../features/blogs/infrastructure/blogs-mongo-query.repository';
import { BlogsMongoRepository } from '../features/blogs/infrastructure/blogs-mongo.repository';
import { BlogsService } from '../features/blogs/application/blogs.service';
import { PostsController } from '../features/posts/api/posts.contoller';
import { PostsService } from '../features/posts/application/posts.service';
import { PostsMongoRepository } from '../features/posts/infrastructure/posts-mongo.repository';
import { CommentsMongoQueryRepository } from '../features/comments/infrastructure/comments-mongo-query.repository';
import { Post, PostSchema } from '../features/posts/domain/Post.entity';
import {
  Comment,
  CommentSchema,
} from '../features/comments/domain/Comment.entity';
import { Like, LikeSchema } from '../features/likes/domain/Like.entity';
import {
  ExtendedLikes,
  ExtendedLikesSchema,
} from '../features/likes/domain/ExtendedLikes.entity';
import { CommentsController } from '../features/comments/api/comments.contoller';
import { PostsMongoQueryRepository } from '../features/posts/infrastructure/posts-mongo-query.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config, { envConfig, EnvVariables } from '../config/env-config';
import { UserLoginOrEmailExistsConstraint } from '../infrastructure/decorators/validation/is-user-login-available';
import { AuthController } from '../features/auth/api/auth.contoller';
import { JwtService } from '../application/jwt.service';
import { AuthService } from '../features/auth/application/auth.service';
import { Session, SessionSchema } from '../features/auth/domain/Session.entity';
import { AuthMongoRepository } from '../features/auth/infrastructure/auth-mongo.repository';
import { UserInfoFromTokenIfExists } from '../infrastructure/middlewares/get-info-from-token-if-exists';
import { EmailManager } from '../adapters/email.manager';
import { MailerModule } from '@nestjs-modules/mailer';
import { CommentsMongoRepository } from '../features/comments/infrastructure/comments-mongo.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateCommentHandler } from '../features/comments/application/use-cases/update-comment.handler';
import { CreateCommentHandler } from '../features/posts/application/use-cases/create-comment.handler';
import { UpdatePostLikeHandler } from '../features/posts/application/use-cases/update-post-like-status.handler';
import { DeleteCommentHandler } from '../features/comments/application/use-cases/delete-comment.handler';
import { UpdateCommentLikeHandler } from '../features/comments/application/use-cases/update-comment-like.handler';
import { IsBlogIdExistsConstraint } from '../infrastructure/decorators/validation/is-blogId-available';
import { ThrottlerModule } from '@nestjs/throttler';
import { SecurityController } from '../features/auth/api/security.controller';
import { GetSessionDevicesHandler } from '../features/auth/application/use-cases/get-session-devices.handler';
import { SecurityMongoQueryRepository } from '../features/auth/infrastructure/security-mongo-query.repository';
import { RemoveAllButCurrentSessionHandler } from '../features/auth/application/use-cases/remove-all-but-current-sessions.handler';
import { RemoveSessionByIdHandler } from '../features/auth/application/use-cases/remove-session-by-id.handler';
import {
  repositoriesList,
  RepositoryVariant,
} from '../config/repository-config';

const CommandHandlers = [
  UpdateCommentHandler,
  CreateCommentHandler,
  UpdatePostLikeHandler,
  DeleteCommentHandler,
  UpdateCommentLikeHandler,
  GetSessionDevicesHandler,
  RemoveAllButCurrentSessionHandler,
  RemoveSessionByIdHandler,
];

const Controllers = [
  AppController,
  TestingController,
  UsersController,
  BlogsController,
  PostsController,
  CommentsController,
  AuthController,
  SecurityController,
];

const Repositories = repositoriesList.map((repo) => {
  return {
    provide: repo.name,
    useFactory: (configService: ConfigService) => {
      console.log('configService:', configService);
      const repositoryProviderName = configService.get<RepositoryVariant>(
        EnvVariables.REPOSITORY,
      );

      console.log('repositoryProviderName:', repositoryProviderName);

      return repo[repositoryProviderName!];
    },
    inject: [ConfigService],
  };
});

// console.log('Repositories:', Repositories);

const MongoRepositories: Provider[] = [
  UsersMongoQueryRepository,
  BlogsMongoQueryRepository,
  BlogsMongoRepository,
  PostsMongoRepository,
  PostsMongoQueryRepository,
  CommentsMongoQueryRepository,
  AuthMongoRepository,
  CommentsMongoRepository,
  SecurityMongoQueryRepository,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    CqrsModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Make sure ConfigService is available
      inject: [ConfigService], // Inject ConfigService to use it in factory
      useFactory: (config: ConfigService) => ({
        defaults: {
          from: 'Blog <blog.kashuba.sender@gmail.com>',
          subject: 'Blog operation',
        },
        transport: {
          service: 'gmail',
          auth: {
            user: 'blog.kashuba.sender@gmail.com',
            pass: config.get(EnvVariables.EMAIL_SENDER_PASSWORD),
          },
        },
      }),
    }),
    MongooseModule.forRoot(envConfig.MONGO_URI, {
      dbName: envConfig.DB_NAME,
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: ExtendedLikes.name, schema: ExtendedLikesSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [...Controllers],
  providers: [
    ...Repositories,
    ...MongoRepositories,
    JwtService,
    EmailManager,
    AppService,
    PaginationService,
    UsersService,
    BlogsService,
    PostsService,
    UserLoginOrEmailExistsConstraint,
    IsBlogIdExistsConstraint,
    AuthService,
    ...CommandHandlers,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserInfoFromTokenIfExists).forRoutes('*');
  }
}
