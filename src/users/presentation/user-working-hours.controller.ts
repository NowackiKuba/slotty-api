import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@common/application/cqrs';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@auth/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
import { SetUserWorkingHoursDayCommand } from '@users/application/commands/set-user-working-hours-day/set-user-working-hours-day.command';
import { SetUserWorkingHoursWeekCommand } from '@users/application/commands/set-user-working-hours-week/set-user-working-hours-week.command';
import { ListUserWorkingHoursQuery } from '@users/application/queries/list-user-working-hours/list-user-working-hours.query';
import {
  SetUserWorkingHoursDayDto,
  SetUserWorkingHoursWeekDto,
} from './dto/user-working-hours.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserWorkingHoursController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me/working-hours')
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.queryBus.execute(
      new ListUserWorkingHoursQuery({ userId: user.userId }),
    );
  }

  @Put('me/working-hours')
  setWeek(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: SetUserWorkingHoursWeekDto,
  ) {
    return this.commandBus.execute(
      new SetUserWorkingHoursWeekCommand({
        userId: user.userId,
        days: body.days,
      }),
    );
  }

  @Patch('me/working-hours/:dayOfWeek')
  setDay(
    @CurrentUser() user: CurrentUserPayload,
    @Param('dayOfWeek', ParseIntPipe) dayOfWeek: number,
    @Body() body: SetUserWorkingHoursDayDto,
  ) {
    return this.commandBus.execute(
      new SetUserWorkingHoursDayCommand({
        userId: user.userId,
        dayOfWeek,
        ...body,
      }),
    );
  }
}
