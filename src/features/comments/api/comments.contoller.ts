import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ValidateObjectIdPipe } from '../../../common/pipes/object-id.pipe';
import { Types } from 'mongoose';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';
import { CommentOutputModel } from './models/output/comment.output.model';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
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
}
