import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IsEnum, IsNotEmpty, validateOrReject } from 'class-validator';
import { Types } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { NotFoundException } from '@nestjs/common';
import { PostsMongoRepository } from '../../infrastructure/posts-mongo.repository';
import { LIKE_STATUS } from '../../../likes/domain/like.type';
import { UserTokenInfo } from '../../../auth/types/auth.types';
import { TPostDocument } from '../../domain/Post.entity';

export class UpdatePostLikeStatusCommand {
  @IsNotEmpty()
  postId: Types.ObjectId;
  @IsNotEmpty()
  user: UserTokenInfo;
  @IsEnum(LIKE_STATUS)
  likeStatus: LIKE_STATUS;

  constructor(data: UpdatePostLikeStatusCommand) {
    Object.assign(this, plainToClass(UpdatePostLikeStatusCommand, data));
  }
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeHandler
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(private postsRepository: PostsMongoRepository) {}

  async execute(command: UpdatePostLikeStatusCommand) {
    await validateOrReject(command);

    const { postId, likeStatus, user } = command;

    const post: TPostDocument | null =
      await this.postsRepository.findPostById(postId);

    if (!post) {
      throw new NotFoundException();
    }

    await post.like(likeStatus, user.userId, user.login);

    await this.postsRepository.save(post);
  }
}
