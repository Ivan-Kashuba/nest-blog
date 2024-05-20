import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { IsEnum, IsNotEmpty, validateOrReject } from 'class-validator';
import { Types } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { NotFoundException } from '@nestjs/common';
import { LIKE_STATUS } from '../../../likes/domain/like.type';

export class UpdateCommentLikeCommand {
  @IsNotEmpty()
  userId: Types.ObjectId;
  @IsNotEmpty()
  commentId: Types.ObjectId;
  @IsEnum(LIKE_STATUS)
  likeStatus: LIKE_STATUS;

  constructor(data: UpdateCommentLikeCommand) {
    Object.assign(this, plainToClass(UpdateCommentLikeCommand, data));
  }
}

@CommandHandler(UpdateCommentLikeCommand)
export class UpdateCommentLikeHandler
  implements ICommandHandler<UpdateCommentLikeCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentLikeCommand) {
    await validateOrReject(command);

    const { commentId, likeStatus, userId } = command;

    const commentToLike =
      await this.commentsRepository.findCommentById(commentId);

    if (!commentToLike) {
      throw new NotFoundException();
    }

    await commentToLike.like(likeStatus, userId);

    await this.commentsRepository.save(commentToLike);
  }
}
