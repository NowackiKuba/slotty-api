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
import { ActivateCustomerCommand } from '@customers/application/commands/activate-customer/activate-customer.command';
import { BlockCustomerCommand } from '@customers/application/commands/block-customer/block-customer.command';
import { ChangeCustomerAiOptOutCommand } from '@customers/application/commands/change-customer-ai-opt-out/change-customer-ai-opt-out.command';
import { ChangeCustomerAvatarUrlCommand } from '@customers/application/commands/change-customer-avatar-url/change-customer-avatar-url.command';
import { ChangeCustomerEmailCommand } from '@customers/application/commands/change-customer-email/change-customer-email.command';
import { ChangeCustomerNicknameCommand } from '@customers/application/commands/change-customer-nickname/change-customer-nickname.command';
import { ChangeCustomerPhoneNumberCommand } from '@customers/application/commands/change-customer-phone-number/change-customer-phone-number.command';
import { ChangeCustomerPreferredLanguageCommand } from '@customers/application/commands/change-customer-preferred-language/change-customer-preferred-language.command';
import { ChangeCustomerSocialAccountsCommand } from '@customers/application/commands/change-customer-social-accounts/change-customer-social-accounts.command';
import { ChangeCustomerTrainingNotesCommand } from '@customers/application/commands/change-customer-training-notes/change-customer-training-notes.command';
import { CreateCustomerCommand } from '@customers/application/commands/create-customer/create-customer.command';
import { DeactivateCustomerCommand } from '@customers/application/commands/deactivate-customer/deactivate-customer.command';
import { RenameCustomerCommand } from '@customers/application/commands/rename-customer/rename-customer.command';
import { RestoreCustomerCommand } from '@customers/application/commands/restore-customer/restore-customer.command';
import { SoftDeleteCustomerCommand } from '@customers/application/commands/soft-delete-customer/soft-delete-customer.command';
import { UnblockCustomerCommand } from '@customers/application/commands/unblock-customer/unblock-customer.command';
import { GetCustomerByIdQuery } from '@customers/application/queries/get-customer-by-id/get-customer-by-id.query';
import { ListCustomersQuery } from '@customers/application/queries/list-customers/list-customers.query';
import {
  ChangeCustomerAiOptOutDto,
  ChangeCustomerAvatarUrlDto,
  ChangeCustomerEmailDto,
  ChangeCustomerNicknameDto,
  ChangeCustomerPhoneNumberDto,
  ChangeCustomerPreferredLanguageDto,
  ChangeCustomerSocialAccountsDto,
  ChangeCustomerTrainingNotesDto,
  CreateCustomerDto,
  RenameCustomerDto,
} from './dto/customers.dto';

const emptyToNull = (value?: string | null): string | null => {
  if (value === undefined || value === '') {
    return null;
  }

  return value;
};

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
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
      new ListCustomersQuery({
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
    @Body() body: CreateCustomerDto,
  ) {
    return this.commandBus.execute(
      new CreateCustomerCommand({
        userId: user.userId,
        source: body.source,
        firstName: body.firstName,
        lastName: emptyToNull(body.lastName),
        nickname: emptyToNull(body.nickname),
        email: emptyToNull(body.email),
        phoneNumber: emptyToNull(body.phoneNumber),
        avatarUrl: emptyToNull(body.avatarUrl),
        instagramAccountId: emptyToNull(body.instagramAccountId),
        whatsappAccountId: emptyToNull(body.whatsappAccountId),
      }),
    );
  }

  @Get(':customerId')
  getById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
  ) {
    return this.queryBus.execute(
      new GetCustomerByIdQuery({
        userId: user.userId,
        customerId,
      }),
    );
  }

  @Patch(':customerId')
  rename(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
    @Body() body: RenameCustomerDto,
  ) {
    return this.commandBus.execute(
      new RenameCustomerCommand({
        userId: user.userId,
        customerId,
        firstName: body.firstName,
        lastName: emptyToNull(body.lastName),
      }),
    );
  }

  @Patch(':customerId/nickname')
  changeNickname(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
    @Body() body: ChangeCustomerNicknameDto,
  ) {
    return this.commandBus.execute(
      new ChangeCustomerNicknameCommand({
        userId: user.userId,
        customerId,
        nickname: emptyToNull(body.nickname),
      }),
    );
  }

  @Patch(':customerId/email')
  changeEmail(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
    @Body() body: ChangeCustomerEmailDto,
  ) {
    return this.commandBus.execute(
      new ChangeCustomerEmailCommand({
        userId: user.userId,
        customerId,
        email: emptyToNull(body.email),
      }),
    );
  }

  @Patch(':customerId/phone')
  changePhone(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
    @Body() body: ChangeCustomerPhoneNumberDto,
  ) {
    return this.commandBus.execute(
      new ChangeCustomerPhoneNumberCommand({
        userId: user.userId,
        customerId,
        phoneNumber: emptyToNull(body.phoneNumber),
      }),
    );
  }

  @Patch(':customerId/avatar')
  changeAvatar(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
    @Body() body: ChangeCustomerAvatarUrlDto,
  ) {
    return this.commandBus.execute(
      new ChangeCustomerAvatarUrlCommand({
        userId: user.userId,
        customerId,
        avatarUrl: emptyToNull(body.avatarUrl),
      }),
    );
  }

  @Patch(':customerId/social-accounts')
  changeSocialAccounts(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
    @Body() body: ChangeCustomerSocialAccountsDto,
  ) {
    return this.commandBus.execute(
      new ChangeCustomerSocialAccountsCommand({
        userId: user.userId,
        customerId,
        instagramAccountId:
          body.instagramAccountId === undefined
            ? undefined
            : emptyToNull(body.instagramAccountId),
        whatsappAccountId:
          body.whatsappAccountId === undefined
            ? undefined
            : emptyToNull(body.whatsappAccountId),
      }),
    );
  }

  @Patch(':customerId/training-notes')
  changeTrainingNotes(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
    @Body() body: ChangeCustomerTrainingNotesDto,
  ) {
    return this.commandBus.execute(
      new ChangeCustomerTrainingNotesCommand({
        userId: user.userId,
        customerId,
        equipmentToBring: body.equipmentToBring,
        focusAreas: body.focusAreas,
        healthNotes:
          body.healthNotes === undefined
            ? undefined
            : emptyToNull(body.healthNotes),
        generalNotes:
          body.generalNotes === undefined
            ? undefined
            : emptyToNull(body.generalNotes),
      }),
    );
  }

  @Patch(':customerId/ai-opt-out')
  changeAiOptOut(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
    @Body() body: ChangeCustomerAiOptOutDto,
  ) {
    return this.commandBus.execute(
      new ChangeCustomerAiOptOutCommand({
        userId: user.userId,
        customerId,
        aiOptOut: body.aiOptOut,
      }),
    );
  }

  @Patch(':customerId/preferred-language')
  changePreferredLanguage(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
    @Body() body: ChangeCustomerPreferredLanguageDto,
  ) {
    return this.commandBus.execute(
      new ChangeCustomerPreferredLanguageCommand({
        userId: user.userId,
        customerId,
        preferredLanguage: body.preferredLanguage,
      }),
    );
  }

  @Post(':customerId/activate')
  activate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
  ) {
    return this.commandBus.execute(
      new ActivateCustomerCommand({
        userId: user.userId,
        customerId,
      }),
    );
  }

  @Post(':customerId/deactivate')
  deactivate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
  ) {
    return this.commandBus.execute(
      new DeactivateCustomerCommand({
        userId: user.userId,
        customerId,
      }),
    );
  }

  @Post(':customerId/block')
  block(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
  ) {
    return this.commandBus.execute(
      new BlockCustomerCommand({
        userId: user.userId,
        customerId,
      }),
    );
  }

  @Post(':customerId/unblock')
  unblock(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
  ) {
    return this.commandBus.execute(
      new UnblockCustomerCommand({
        userId: user.userId,
        customerId,
      }),
    );
  }

  @Post(':customerId/restore')
  restore(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
  ) {
    return this.commandBus.execute(
      new RestoreCustomerCommand({
        userId: user.userId,
        customerId,
      }),
    );
  }

  @Delete(':customerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
  ) {
    return this.commandBus.execute(
      new SoftDeleteCustomerCommand({
        userId: user.userId,
        customerId,
      }),
    );
  }
}
