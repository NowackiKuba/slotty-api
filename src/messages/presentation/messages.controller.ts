import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@common/application/cqrs';
import { PaginationQuery } from '@common/pagination';
import { generateUUID } from '@common/uuid';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@auth/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
import { CreateMessageCommand } from '@messages/application/commands/create-message/create-message.command';
import { RecordMessageToolExecutionCommand } from '@messages/application/commands/record-message-tool-execution/record-message-tool-execution.command';
import { RestoreMessageCommand } from '@messages/application/commands/restore-message/restore-message.command';
import { SoftDeleteMessageCommand } from '@messages/application/commands/soft-delete-message/soft-delete-message.command';
import { GetMessageByIdQuery } from '@messages/application/queries/get-message-by-id/get-message-by-id.query';
import { ListCustomerMessagesQuery } from '@messages/application/queries/list-customer-messages/list-customer-messages.query';
import { ListMessagesQuery } from '@messages/application/queries/list-messages/list-messages.query';
import {
  CreateMessageDto,
  ListCustomerMessagesQueryDto,
  RecordMessageToolExecutionDto,
} from './dto/messages.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: PaginationQuery,
  ) {
    return this.queryBus.execute(
      new ListMessagesQuery({
        userId: user.userId,
        page: query.page,
        limit: query.limit,
      }),
    );
  }

  @Get('thread')
  listThread(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: ListCustomerMessagesQueryDto,
  ) {
    return this.queryBus.execute(
      new ListCustomerMessagesQuery({
        userId: user.userId,
        customerId: query.customerId,
        page: query.page,
        limit: query.limit,
      }),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: CreateMessageDto,
  ) {
    return this.commandBus.execute(
      new CreateMessageCommand({
        userId: user.userId,
        customerId: body.customerId,
        messageContent: body.messageContent,
        sender: body.sender,
        channel: body.channel,
        externalMessageId: body.externalMessageId ?? generateUUID(),
        metadata: body.metadata,
      }),
    );
  }

  @Get(':messageId')
  getById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('messageId') messageId: string,
  ) {
    return this.queryBus.execute(
      new GetMessageByIdQuery({
        userId: user.userId,
        messageId,
      }),
    );
  }

  @Post(':messageId/tools')
  recordToolExecution(
    @CurrentUser() user: CurrentUserPayload,
    @Param('messageId') messageId: string,
    @Body() body: RecordMessageToolExecutionDto,
  ) {
    return this.commandBus.execute(
      new RecordMessageToolExecutionCommand({
        userId: user.userId,
        messageId,
        tool: {
          toolName: body.toolName,
          args: body.args,
          result: body.result,
        },
      }),
    );
  }

  @Post(':messageId/restore')
  restore(
    @CurrentUser() user: CurrentUserPayload,
    @Param('messageId') messageId: string,
  ) {
    return this.commandBus.execute(
      new RestoreMessageCommand({
        userId: user.userId,
        messageId,
      }),
    );
  }

  @Delete(':messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('messageId') messageId: string,
  ) {
    return this.commandBus.execute(
      new SoftDeleteMessageCommand({
        userId: user.userId,
        messageId,
      }),
    );
  }
}
