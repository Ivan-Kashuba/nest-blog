import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from '../features/users/api/users.contoller';
import { UsersService } from '../features/users/application/users.service';
import { UsersRepository } from '../features/users/infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../features/users/domain/User.entity';
import { UsersQueryRepository } from '../features/users/infrastructure/users.query.repository';
import { PaginationService } from '../infrastructure/pagination/service/pagination.service';
import { TestingController } from '../features/testing/api/testing.controller';
import { BlogsController } from '../features/blogs/api/blogs.contoller';
import { Blog, BlogSchema } from '../features/blogs/domain/Blog.entity';
import { BlogsQueryRepository } from '../features/blogs/infrastructure/blogs.query.repository';
import { BlogsRepository } from '../features/blogs/infrastructure/blogs.repository';
import { BlogsService } from '../features/blogs/application/blogs.service';
import { PostsController } from '../features/posts/api/posts.contoller';
import { PostsService } from '../features/posts/application/posts.service';
import { PostsRepository } from '../features/posts/infrastructure/posts.repository';
import { CommentsQueryRepository } from '../features/comments/infrastructure/comments.query.repository';
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
import { PostsQueryRepository } from '../features/posts/infrastructure/posts.query.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config, { envConfig, EnvVariables } from '../config/env-config';
import { UserLoginOrEmailExistsConstraint } from '../infrastructure/decorators/validation/is-user-login-available';
import { AuthController } from '../features/auth/api/auth.contoller';
import { JwtService } from '../application/jwt.service';
import { AuthService } from '../features/auth/application/auth.service';
import { Session, SessionSchema } from '../features/auth/domain/Session.entity';
import { AuthRepository } from '../features/auth/infrastructure/auth.repository';
import { UserInfoFromTokenIfExists } from '../infrastructure/middlewares/get-info-from-token-if-exists';
import { EmailManager } from '../adapters/email.manager';
import { MailerModule } from '@nestjs-modules/mailer';
import { CommentsRepository } from '../features/comments/infrastructure/comments.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateCommentHandler } from '../features/comments/application/use-cases/update-comment.handler';
import { CreateCommentHandler } from '../features/posts/application/use-cases/create-comment.handler';
import { UpdatePostLikeHandler } from '../features/posts/application/use-cases/update-post-like-status.handler';
import { DeleteCommentHandler } from '../features/comments/application/use-cases/delete-comment.handler';
import { UpdateCommentLikeHandler } from '../features/comments/application/use-cases/update-comment-like.handler';

export const CommandHandlers = [
  UpdateCommentHandler,
  CreateCommentHandler,
  UpdatePostLikeHandler,
  DeleteCommentHandler,
  UpdateCommentLikeHandler,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
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
  controllers: [
    AppController,
    TestingController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    AuthController,
  ],
  providers: [
    JwtService,
    EmailManager,
    AppService,
    PaginationService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    BlogsQueryRepository,
    BlogsRepository,
    BlogsService,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
    UserLoginOrEmailExistsConstraint,
    AuthService,
    AuthRepository,
    CommentsRepository,
    ...CommandHandlers,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserInfoFromTokenIfExists).forRoutes('*');
  }
}
