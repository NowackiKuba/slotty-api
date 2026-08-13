import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@common/application/cqrs';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@auth/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
import { ChangeUserAvatarUrlCommand } from '@users/application/commands/change-user-avatar-url/change-user-avatar-url.command';
import { ChangeUserDisplayNameCommand } from '@users/application/commands/change-user-display-name/change-user-display-name.command';
import { ChangeUserTimezoneCommand } from '@users/application/commands/change-user-timezone/change-user-timezone.command';
import { RenameUserCommand } from '@users/application/commands/rename-user/rename-user.command';
import { GetUserByIdQuery } from '@users/application/queries/get-user-by-id/get-user-by-id.query';
import {
  ChangeUserAvatarUrlDto,
  ChangeUserDisplayNameDto,
  ChangeUserTimezoneDto,
  RenameUserDto,
} from './dto/users.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.queryBus.execute(new GetUserByIdQuery({ id: user.userId }));
  }

  @Patch('me')
  rename(@CurrentUser() user: CurrentUserPayload, @Body() body: RenameUserDto) {
    return this.commandBus.execute(
      new RenameUserCommand({
        id: user.userId,
        firstName: body.firstName,
        lastName: body.lastName,
      }),
    );
  }

  @Patch('me/display-name')
  changeDisplayName(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: ChangeUserDisplayNameDto,
  ) {
    return this.commandBus.execute(
      new ChangeUserDisplayNameCommand({
        id: user.userId,
        displayName: body.displayName,
      }),
    );
  }

  @Patch('me/avatar')
  changeAvatar(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: ChangeUserAvatarUrlDto,
  ) {
    return this.commandBus.execute(
      new ChangeUserAvatarUrlCommand({
        id: user.userId,
        avatarUrl: body.avatarUrl,
      }),
    );
  }

  @Patch('me/timezone')
  changeTimezone(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: ChangeUserTimezoneDto,
  ) {
    return this.commandBus.execute(
      new ChangeUserTimezoneCommand({
        id: user.userId,
        timezone: body.timezone,
      }),
    );
  }
}
