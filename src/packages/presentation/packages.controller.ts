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
import { ActivatePackageTemplateCommand } from '@packages/application/commands/activate-package-template/activate-package-template.command';
import { CancelCustomerPackageCommand } from '@packages/application/commands/cancel-customer-package/cancel-customer-package.command';
import { ConsumeCustomerPackageSessionCommand } from '@packages/application/commands/consume-customer-package-session/consume-customer-package-session.command';
import { CreateCustomerPackageCommand } from '@packages/application/commands/create-customer-package/create-customer-package.command';
import { CreatePackageTemplateCommand } from '@packages/application/commands/create-package-template/create-package-template.command';
import { DeactivatePackageTemplateCommand } from '@packages/application/commands/deactivate-package-template/deactivate-package-template.command';
import { ExpireCustomerPackageCommand } from '@packages/application/commands/expire-customer-package/expire-customer-package.command';
import { ExtendCustomerPackageCommand } from '@packages/application/commands/extend-customer-package/extend-customer-package.command';
import { MarkCustomerPackagePaidCommand } from '@packages/application/commands/mark-customer-package-paid/mark-customer-package-paid.command';
import { MarkCustomerPackageUnpaidCommand } from '@packages/application/commands/mark-customer-package-unpaid/mark-customer-package-unpaid.command';
import { RestoreCustomerPackageCommand } from '@packages/application/commands/restore-customer-package/restore-customer-package.command';
import { RestoreCustomerPackageSessionCommand } from '@packages/application/commands/restore-customer-package-session/restore-customer-package-session.command';
import { RestorePackageTemplateCommand } from '@packages/application/commands/restore-package-template/restore-package-template.command';
import { SoftDeleteCustomerPackageCommand } from '@packages/application/commands/soft-delete-customer-package/soft-delete-customer-package.command';
import { SoftDeletePackageTemplateCommand } from '@packages/application/commands/soft-delete-package-template/soft-delete-package-template.command';
import { UpdatePackageTemplateCommand } from '@packages/application/commands/update-package-template/update-package-template.command';
import { GetCustomerPackageByIdQuery } from '@packages/application/queries/get-customer-package-by-id/get-customer-package-by-id.query';
import { GetPackageTemplateByIdQuery } from '@packages/application/queries/get-package-template-by-id/get-package-template-by-id.query';
import { ListCustomerPackagesByCustomerQuery } from '@packages/application/queries/list-customer-packages-by-customer/list-customer-packages-by-customer.query';
import { ListCustomerPackagesQuery } from '@packages/application/queries/list-customer-packages/list-customer-packages.query';
import { ListPackageTemplatesQuery } from '@packages/application/queries/list-package-templates/list-package-templates.query';
import {
  CreateCustomerPackageDto,
  CreatePackageTemplateDto,
  ExtendCustomerPackageDto,
  UpdatePackageTemplateDto,
} from './dto/packages.dto';

const emptyToUndefined = (value?: string | null): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return value;
};

@Controller('packages')
@UseGuards(JwtAuthGuard)
export class PackagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('templates')
  listTemplates(@CurrentUser() user: CurrentUserPayload) {
    return this.queryBus.execute(
      new ListPackageTemplatesQuery({ userId: user.userId }),
    );
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  createTemplate(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: CreatePackageTemplateDto,
  ) {
    return this.commandBus.execute(
      new CreatePackageTemplateCommand({
        userId: user.userId,
        name: body.name,
        description: emptyToUndefined(body.description),
        sessionCount: body.sessionCount,
        price: body.price,
        currency: body.currency,
        validityDays: body.validityDays,
        isActive: body.isActive,
      }),
    );
  }

  @Get('templates/:packageTemplateId')
  getTemplate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('packageTemplateId') packageTemplateId: string,
  ) {
    return this.queryBus.execute(
      new GetPackageTemplateByIdQuery({
        userId: user.userId,
        packageTemplateId,
      }),
    );
  }

  @Patch('templates/:packageTemplateId')
  updateTemplate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('packageTemplateId') packageTemplateId: string,
    @Body() body: UpdatePackageTemplateDto,
  ) {
    return this.commandBus.execute(
      new UpdatePackageTemplateCommand({
        userId: user.userId,
        packageTemplateId,
        name: body.name,
        description:
          body.description === undefined
            ? undefined
            : body.description === ''
              ? null
              : body.description,
        sessionCount: body.sessionCount,
        price: body.price,
        currency: body.currency,
        validityDays: body.validityDays,
        isActive: body.isActive,
      }),
    );
  }

  @Post('templates/:packageTemplateId/activate')
  activateTemplate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('packageTemplateId') packageTemplateId: string,
  ) {
    return this.commandBus.execute(
      new ActivatePackageTemplateCommand({
        userId: user.userId,
        packageTemplateId,
      }),
    );
  }

  @Post('templates/:packageTemplateId/deactivate')
  deactivateTemplate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('packageTemplateId') packageTemplateId: string,
  ) {
    return this.commandBus.execute(
      new DeactivatePackageTemplateCommand({
        userId: user.userId,
        packageTemplateId,
      }),
    );
  }

  @Post('templates/:packageTemplateId/restore')
  restoreTemplate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('packageTemplateId') packageTemplateId: string,
  ) {
    return this.commandBus.execute(
      new RestorePackageTemplateCommand({
        userId: user.userId,
        packageTemplateId,
      }),
    );
  }

  @Delete('templates/:packageTemplateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTemplate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('packageTemplateId') packageTemplateId: string,
  ) {
    return this.commandBus.execute(
      new SoftDeletePackageTemplateCommand({
        userId: user.userId,
        packageTemplateId,
      }),
    );
  }

  @Get('customers/:customerId')
  listByCustomer(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerId') customerId: string,
  ) {
    return this.queryBus.execute(
      new ListCustomerPackagesByCustomerQuery({
        userId: user.userId,
        customerId,
      }),
    );
  }

  @Get()
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: PaginationQuery,
  ) {
    return this.queryBus.execute(
      new ListCustomerPackagesQuery({
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
    @Body() body: CreateCustomerPackageDto,
  ) {
    return this.commandBus.execute(
      new CreateCustomerPackageCommand({
        userId: user.userId,
        customerId: body.customerId,
        packageTemplateId: body.packageTemplateId,
        name: body.name,
        totalSessions: body.totalSessions,
        remainingSessions: body.remainingSessions,
        pricePaid: body.pricePaid,
        currency: body.currency,
        isPaid: body.isPaid,
        expiresAt: body.expiresAt,
      }),
    );
  }

  @Get(':customerPackageId')
  getById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerPackageId') customerPackageId: string,
  ) {
    return this.queryBus.execute(
      new GetCustomerPackageByIdQuery({
        userId: user.userId,
        customerPackageId,
      }),
    );
  }

  @Post(':customerPackageId/consume')
  consume(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerPackageId') customerPackageId: string,
  ) {
    return this.commandBus.execute(
      new ConsumeCustomerPackageSessionCommand({
        userId: user.userId,
        customerPackageId,
      }),
    );
  }

  @Post(':customerPackageId/restore-session')
  restoreSession(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerPackageId') customerPackageId: string,
  ) {
    return this.commandBus.execute(
      new RestoreCustomerPackageSessionCommand({
        userId: user.userId,
        customerPackageId,
      }),
    );
  }

  @Post(':customerPackageId/pay')
  markPaid(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerPackageId') customerPackageId: string,
  ) {
    return this.commandBus.execute(
      new MarkCustomerPackagePaidCommand({
        userId: user.userId,
        customerPackageId,
      }),
    );
  }

  @Post(':customerPackageId/unpay')
  markUnpaid(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerPackageId') customerPackageId: string,
  ) {
    return this.commandBus.execute(
      new MarkCustomerPackageUnpaidCommand({
        userId: user.userId,
        customerPackageId,
      }),
    );
  }

  @Post(':customerPackageId/expire')
  expire(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerPackageId') customerPackageId: string,
  ) {
    return this.commandBus.execute(
      new ExpireCustomerPackageCommand({
        userId: user.userId,
        customerPackageId,
      }),
    );
  }

  @Post(':customerPackageId/cancel')
  cancel(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerPackageId') customerPackageId: string,
  ) {
    return this.commandBus.execute(
      new CancelCustomerPackageCommand({
        userId: user.userId,
        customerPackageId,
      }),
    );
  }

  @Patch(':customerPackageId/extend')
  extend(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerPackageId') customerPackageId: string,
    @Body() body: ExtendCustomerPackageDto,
  ) {
    return this.commandBus.execute(
      new ExtendCustomerPackageCommand({
        userId: user.userId,
        customerPackageId,
        expiresAt: body.expiresAt,
      }),
    );
  }

  @Post(':customerPackageId/restore')
  restore(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerPackageId') customerPackageId: string,
  ) {
    return this.commandBus.execute(
      new RestoreCustomerPackageCommand({
        userId: user.userId,
        customerPackageId,
      }),
    );
  }

  @Delete(':customerPackageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('customerPackageId') customerPackageId: string,
  ) {
    return this.commandBus.execute(
      new SoftDeleteCustomerPackageCommand({
        userId: user.userId,
        customerPackageId,
      }),
    );
  }
}
