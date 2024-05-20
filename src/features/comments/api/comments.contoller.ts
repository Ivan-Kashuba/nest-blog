import {
  Body,
  Controller,
  Delete,
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
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.handler';
import { UpdateCommentLikeCommand } from '../application/use-cases/update-comment-like.handler';
import { LikeInputModel } from '../../likes/api/models/input/like.input.model';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get(':commentId')
  async getComment(
    @Param('commentId', ValidateObjectIdPipe) commentId: Types.ObjectId,
    @User('userId') userId: Types.ObjectId,
  ): Promise<CommentOutputModel> {
    const foundComment = await this.commentsQueryRepository.findCommentById(
      commentId,
      userId,
    );

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

  @Put(':commentId/like-status')
  @UseGuards(UserAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @Param('commentId', ValidateObjectIdPipe) commentId: Types.ObjectId,
    @Body() { likeStatus }: LikeInputModel,
    @User('userId') userId: Types.ObjectId,
  ) {
    const command = new UpdateCommentLikeCommand({
      commentId,
      likeStatus,
      userId,
    });

    await this.commandBus.execute(command);
  }

  @Delete(':commentId')
  @UseGuards(UserAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId', ValidateObjectIdPipe) commentId: Types.ObjectId,
    @User('userId') userId: Types.ObjectId,
  ) {
    const deleteCommentCommand = new DeleteCommentCommand({
      commentId,
      userId,
    });

    await this.commandBus.execute(deleteCommentCommand);
  }
}
