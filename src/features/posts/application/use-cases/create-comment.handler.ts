import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IsNotEmpty, Length, validateOrReject } from 'class-validator';
import { Types } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  TCommentModel,
} from '../../../comments/domain/Comment.entity';
import { UserTokenInfo } from '../../../auth/types/auth.types';

export class CreateCommentCommand {
  user: UserTokenInfo;
  @IsNotEmpty()
  postId: Types.ObjectId;
  @Length(20, 300)
  content: string;

  constructor(data: CreateCommentCommand) {
    Object.assign(this, plainToClass(CreateCommentCommand, data));
  }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: TCommentModel,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    await validateOrReject(command);

    const { postId, content, user } = command;

    const post = await this.postsRepository.findPostById(postId);

    if (!post) {
      throw new NotFoundException();
    }

    const comment = await this.CommentModel.create({
      id: new Types.ObjectId(),
      postId,
      content,
      commentatorInfo: {
        userId: user.userId,
        userLogin: user.login,
      },
      createdAt: new Date().toISOString(),
      likes: [],
    });

    await this.commentsRepository.save(comment);

    return comment.id;
  }
}
