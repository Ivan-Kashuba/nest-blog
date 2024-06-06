import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsMongoRepository } from '../../infrastructure/comments-mongo.repository';
import { IsNotEmpty, Length, validateOrReject } from 'class-validator';
import { Types } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateCommentCommand {
  userId?: Types.ObjectId;
  @IsNotEmpty()
  commentId: Types.ObjectId;
  @Length(20, 300)
  content: string;

  constructor(data: UpdateCommentCommand) {
    Object.assign(this, plainToClass(UpdateCommentCommand, data));
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepository: CommentsMongoRepository) {}

  async execute(command: UpdateCommentCommand) {
    await validateOrReject(command);

    const { commentId, content, userId } = command;

    const commentToUpdate =
      await this.commentsRepository.findCommentById(commentId);

    if (!commentToUpdate) {
      throw new NotFoundException();
    }

    if (userId && commentToUpdate?.commentatorInfo.userId !== userId) {
      throw new ForbiddenException();
    }

    commentToUpdate.content = content;

    await this.commentsRepository.save(commentToUpdate);

    return true;
  }
}
