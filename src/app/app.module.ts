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

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017', { dbName: 'local-db' }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    MongooseModule.forFeature([
      { name: ExtendedLikes.name, schema: ExtendedLikesSchema },
    ]),
  ],
  controllers: [
    AppController,
    TestingController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
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
  ],
})
export class AppModule {}
