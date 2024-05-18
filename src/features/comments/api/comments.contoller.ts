import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ValidateObjectIdPipe } from '../../../infrastructure/pipes/object-id.pipe';
import { Types } from 'mongoose';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';
import { CommentOutputModel } from './models/output/comment.output.model';
import { CommentInputModel } from './models/input/create-comment.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.handler';
import { User } from '../../../infrastructure/decorators/transform/get-user';
import { UserAuthGuard } from '../../../infrastructure/guards/user-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get(':commentId')
  async getComment(
    @Param('commentId', ValidateObjectIdPipe) commentId: Types.ObjectId,
  ): Promise<CommentOutputModel> {
    const foundComment =
      await this.commentsQueryRepository.findCommentById(commentId);

    if (!foundComment) {
      throw new NotFoundException();
    }

    return foundComment;
  }

  @Put(':commentId')
  @UseGuards(UserAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId', ValidateObjectIdPipe) commentId: Types.ObjectId,
    @Body() { content }: CommentInputModel,
    @User('userId') userId?: Types.ObjectId,
  ) {
    const command = new UpdateCommentCommand({
      commentId,
      content,
      userId,
    });

    await this.commandBus.execute(command);
  }
}
