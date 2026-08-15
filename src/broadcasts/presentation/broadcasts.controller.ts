import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@common/application/cqrs';
import { PaginationQuery } from '@common/pagination';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@auth/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
import { CompleteBroadcastCommand } from '@broadcasts/application/commands/complete-broadcast/complete-broadcast.command';
import { CreateBroadcastCommand } from '@broadcasts/application/commands/create-broadcast/create-broadcast.command';
import { FailBroadcastCommand } from '@broadcasts/application/commands/fail-broadcast/fail-broadcast.command';
import { RestoreBroadcastCommand } from '@broadcasts/application/commands/restore-broadcast/restore-broadcast.command';
import { SoftDeleteBroadcastCommand } from '@broadcasts/application/commands/soft-delete-broadcast/soft-delete-broadcast.command';
import { StartBroadcastCommand } from '@broadcasts/application/commands/start-broadcast/start-broadcast.command';
import { UpdateBroadcastRecipientCommand } from '@broadcasts/application/commands/update-broadcast-recipient/update-broadcast-recipient.command';
import { UpdateBroadcastCommand } from '@broadcasts/application/commands/update-broadcast/update-broadcast.command';
import { GetBroadcastByIdQuery } from '@broadcasts/application/queries/get-broadcast-by-id/get-broadcast-by-id.query';
import { ListBroadcastsQuery } from '@broadcasts/application/queries/list-broadcasts/list-broadcasts.query';
import {
  CreateBroadcastDto,
  UpdateBroadcastDto,
  UpdateBroadcastRecipientDto,
} from './dto/broadcasts.dto';

@Controller('broadcasts')
@UseGuards(JwtAuthGuard)
export class BroadcastsController {
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
      new ListBroadcastsQuery({
        userId: user.userId,
        page: query.page,
        limit: query.limit,
      }),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: CreateBroadcastDto,
  ) {
    return this.commandBus.execute(
      new CreateBroadcastCommand({
        userId: user.userId,
        messageText: body.messageText,
        targetChannel: body.targetChannel,
        scheduledAt: body.scheduledAt,
        customerIds: body.customerIds,
      }),
    );
  }

  @Get(':broadcastId')
  getById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('broadcastId') broadcastId: string,
  ) {
    return this.queryBus.execute(
      new GetBroadcastByIdQuery({
        userId: user.userId,
        broadcastId,
      }),
    );
  }

  @Patch(':broadcastId')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('broadcastId') broadcastId: string,
    @Body() body: UpdateBroadcastDto,
  ) {
    return this.commandBus.execute(
      new UpdateBroadcastCommand({
        userId: user.userId,
        broadcastId,
        messageText: body.messageText,
        targetChannel: body.targetChannel,
        scheduledAt: body.scheduledAt,
        customerIds: body.customerIds,
      }),
    );
  }

  @Post(':broadcastId/send')
  send(
    @CurrentUser() user: CurrentUserPayload,
    @Param('broadcastId') broadcastId: string,
  ) {
    return this.commandBus.execute(
      new StartBroadcastCommand({
        userId: user.userId,
        broadcastId,
      }),
    );
  }

  @Post(':broadcastId/complete')
  complete(
    @CurrentUser() user: CurrentUserPayload,
    @Param('broadcastId') broadcastId: string,
  ) {
    return this.commandBus.execute(
      new CompleteBroadcastCommand({
        userId: user.userId,
        broadcastId,
      }),
    );
  }

  @Post(':broadcastId/fail')
  fail(
    @CurrentUser() user: CurrentUserPayload,
    @Param('broadcastId') broadcastId: string,
  ) {
    return this.commandBus.execute(
      new FailBroadcastCommand({
        userId: user.userId,
        broadcastId,
      }),
    );
  }

  @Patch(':broadcastId/recipients/:customerId')
  updateRecipient(
    @CurrentUser() user: CurrentUserPayload,
    @Param('broadcastId') broadcastId: string,
    @Param('customerId') customerId: string,
    @Body() body: UpdateBroadcastRecipientDto,
  ) {
    return this.commandBus.execute(
      new UpdateBroadcastRecipientCommand({
        userId: user.userId,
        broadcastId,
        customerId,
        status: body.status,
        messageId: body.messageId,
        errorMessage: body.errorMessage,
      }),
    );
  }

  @Post(':broadcastId/restore')
  restore(
    @CurrentUser() user: CurrentUserPayload,
    @Param('broadcastId') broadcastId: string,
  ) {
    return this.commandBus.execute(
      new RestoreBroadcastCommand({
        userId: user.userId,
        broadcastId,
      }),
    );
  }

  @Delete(':broadcastId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('broadcastId') broadcastId: string,
  ) {
    return this.commandBus.execute(
      new SoftDeleteBroadcastCommand({
        userId: user.userId,
        broadcastId,
      }),
    );
  }
}
