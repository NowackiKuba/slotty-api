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
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@common/application/cqrs';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@auth/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
import { ChangeUserProfileAiCommand } from '@users/application/commands/change-user-profile-ai/change-user-profile-ai.command';
import { ChangeUserProfileDetailsCommand } from '@users/application/commands/change-user-profile-details/change-user-profile-details.command';
import { ChangeUserProfileLocationsCommand } from '@users/application/commands/change-user-profile-locations/change-user-profile-locations.command';
import { ChangeUserProfilePaymentsCommand } from '@users/application/commands/change-user-profile-payments/change-user-profile-payments.command';
import { ChangeUserProfilePricingCommand } from '@users/application/commands/change-user-profile-pricing/change-user-profile-pricing.command';
import { ChangeUserProfileSportsCommand } from '@users/application/commands/change-user-profile-sports/change-user-profile-sports.command';
import { CreateUserProfileCommand } from '@users/application/commands/create-user-profile/create-user-profile.command';
import { SoftDeleteUserProfileCommand } from '@users/application/commands/soft-delete-user-profile/soft-delete-user-profile.command';
import { GetUserProfileByUserIdQuery } from '@users/application/queries/get-user-profile-by-user-id/get-user-profile-by-user-id.query';
import {
  ChangeUserProfileAiDto,
  ChangeUserProfileDetailsDto,
  ChangeUserProfileLocationsDto,
  ChangeUserProfilePaymentsDto,
  ChangeUserProfilePricingDto,
  ChangeUserProfileSportsDto,
  CreateUserProfileDto,
} from './dto/user-profiles.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserProfilesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me/profile')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.queryBus.execute(
      new GetUserProfileByUserIdQuery({ userId: user.userId }),
    );
  }

  @Post('me/profile')
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: CreateUserProfileDto,
  ) {
    return this.commandBus.execute(
      new CreateUserProfileCommand({
        userId: user.userId,
        ...body,
      }),
    );
  }

  @Patch('me/profile')
  changeDetails(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: ChangeUserProfileDetailsDto,
  ) {
    return this.commandBus.execute(
      new ChangeUserProfileDetailsCommand({
        userId: user.userId,
        ...body,
      }),
    );
  }

  @Patch('me/profile/sports')
  changeSports(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: ChangeUserProfileSportsDto,
  ) {
    return this.commandBus.execute(
      new ChangeUserProfileSportsCommand({
        userId: user.userId,
        sports: body.sports,
      }),
    );
  }

  @Patch('me/profile/locations')
  changeLocations(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: ChangeUserProfileLocationsDto,
  ) {
    return this.commandBus.execute(
      new ChangeUserProfileLocationsCommand({
        userId: user.userId,
        ...body,
      }),
    );
  }

  @Patch('me/profile/pricing')
  changePricing(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: ChangeUserProfilePricingDto,
  ) {
    return this.commandBus.execute(
      new ChangeUserProfilePricingCommand({
        userId: user.userId,
        ...body,
      }),
    );
  }

  @Patch('me/profile/payments')
  changePayments(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: ChangeUserProfilePaymentsDto,
  ) {
    return this.commandBus.execute(
      new ChangeUserProfilePaymentsCommand({
        userId: user.userId,
        ...body,
      }),
    );
  }

  @Patch('me/profile/ai')
  changeAi(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: ChangeUserProfileAiDto,
  ) {
    return this.commandBus.execute(
      new ChangeUserProfileAiCommand({
        userId: user.userId,
        ...body,
      }),
    );
  }

  @Delete('me/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: CurrentUserPayload) {
    return this.commandBus.execute(
      new SoftDeleteUserProfileCommand({ userId: user.userId }),
    );
  }

  @Get(':userId/profile')
  byUser(@Param('userId') userId: string) {
    return this.queryBus.execute(new GetUserProfileByUserIdQuery({ userId }));
  }
}
