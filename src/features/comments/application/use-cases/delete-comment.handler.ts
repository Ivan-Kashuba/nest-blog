import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsMongoRepository } from '../../infrastructure/comments-mongo.repository';
import { IsNotEmpty, validateOrReject } from 'class-validator';
import { Types } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteCommentCommand {
  @IsNotEmpty()
  userId?: Types.ObjectId;
  @IsNotEmpty()
  commentId: Types.ObjectId;

  constructor(data: DeleteCommentCommand) {
    Object.assign(this, plainToClass(DeleteCommentCommand, data));
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentsRepository: CommentsMongoRepository) {}

  async execute(command: DeleteCommentCommand) {
    await validateOrReject(command);

    const { commentId, userId } = command;

    const commentToDelete =
      await this.commentsRepository.findCommentById(commentId);

    if (!commentToDelete) {
      throw new NotFoundException();
    }

    if (userId && commentToDelete?.commentatorInfo.userId !== userId) {
      throw new ForbiddenException();
    }

    await commentToDelete.deleteOne();
  }
}
