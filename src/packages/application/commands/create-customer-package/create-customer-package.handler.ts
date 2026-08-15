import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';
import { getOwnedPackageTemplate } from '@packages/application/get-owned-package-template';
import { CustomerPackageReadModelMapper } from '@packages/application/mappers';
import type { CustomerPackageReadModel } from '@packages/application/read-models';
import { CustomerPackage } from '@packages/domain/aggregates';
import {
  InvalidCustomerPackageException,
  InvalidPackageTemplateException,
} from '@packages/domain/exceptions';
import type {
  ICustomerPackageRepository,
  IPackageTemplateRepository,
} from '@packages/domain/repositories';
import {
  CUSTOMER_PACKAGE_REPOSITORY,
  PACKAGE_TEMPLATE_REPOSITORY,
} from '@packages/domain/tokens';
import { CreateCustomerPackageCommand } from './create-customer-package.command';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@CommandHandler(CreateCustomerPackageCommand)
export class CreateCustomerPackageHandler implements ICommandHandler<
  CreateCustomerPackageCommand,
  CustomerPackageReadModel
> {
  constructor(
    private readonly mapper: CustomerPackageReadModelMapper,
    @Inject(CUSTOMER_PACKAGE_REPOSITORY)
    private readonly customerPackageRepository: ICustomerPackageRepository,
    @Inject(PACKAGE_TEMPLATE_REPOSITORY)
    private readonly packageTemplateRepository: IPackageTemplateRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: CreateCustomerPackageCommand,
  ): Promise<CustomerPackageReadModel> {
    const {
      userId,
      customerId,
      packageTemplateId,
      remainingSessions,
      isPaid,
      expiresAt,
    } = command.payload;

    await getOwnedCustomer(this.customerRepository, customerId, userId);

    let name = command.payload.name;
    let totalSessions = command.payload.totalSessions;
    let pricePaid = command.payload.pricePaid;
    let currency = command.payload.currency;
    let resolvedExpiresAt = expiresAt;
    let resolvedTemplateId: string | null = null;

    if (packageTemplateId) {
      const template = await getOwnedPackageTemplate(
        this.packageTemplateRepository,
        packageTemplateId,
        userId,
      );

      if (!template.isActive) {
        throw new InvalidPackageTemplateException(
          'cannot assign an inactive package template',
          { packageTemplateId },
        );
      }

      resolvedTemplateId = template.id.value;
      name = name ?? template.name;
      totalSessions = totalSessions ?? template.sessionCount;
      pricePaid = pricePaid ?? template.price;
      currency = currency ?? template.currency;

      if (resolvedExpiresAt === undefined && template.validityDays) {
        resolvedExpiresAt = new Date(
          Date.now() + template.validityDays * MS_PER_DAY,
        );
      }
    }

    if (
      name === undefined ||
      totalSessions === undefined ||
      pricePaid === undefined
    ) {
      throw new InvalidCustomerPackageException(
        'name, totalSessions and pricePaid are required without a template',
        { field: 'packageTemplateId' },
      );
    }

    const customerPackage = CustomerPackage.create({
      userId,
      customerId,
      packageTemplateId: resolvedTemplateId,
      name,
      totalSessions,
      remainingSessions,
      pricePaid,
      currency,
      isPaid,
      expiresAt: resolvedExpiresAt,
    });

    await this.customerPackageRepository.save(customerPackage);

    return this.mapper.toReadModel(customerPackage);
  }
}
