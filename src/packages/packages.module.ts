import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '@auth/auth.module';
import { CqrsModule } from '@common/application/cqrs';
import { CustomersModule } from '@customers/customers.module';
import { ActivatePackageTemplateHandler } from './application/commands/activate-package-template/activate-package-template.handler';
import { CancelCustomerPackageHandler } from './application/commands/cancel-customer-package/cancel-customer-package.handler';
import { ConsumeCustomerPackageSessionHandler } from './application/commands/consume-customer-package-session/consume-customer-package-session.handler';
import { CreateCustomerPackageHandler } from './application/commands/create-customer-package/create-customer-package.handler';
import { CreatePackageTemplateHandler } from './application/commands/create-package-template/create-package-template.handler';
import { DeactivatePackageTemplateHandler } from './application/commands/deactivate-package-template/deactivate-package-template.handler';
import { ExpireCustomerPackageHandler } from './application/commands/expire-customer-package/expire-customer-package.handler';
import { ExtendCustomerPackageHandler } from './application/commands/extend-customer-package/extend-customer-package.handler';
import { MarkCustomerPackagePaidHandler } from './application/commands/mark-customer-package-paid/mark-customer-package-paid.handler';
import { MarkCustomerPackageUnpaidHandler } from './application/commands/mark-customer-package-unpaid/mark-customer-package-unpaid.handler';
import { RestoreCustomerPackageHandler } from './application/commands/restore-customer-package/restore-customer-package.handler';
import { RestoreCustomerPackageSessionHandler } from './application/commands/restore-customer-package-session/restore-customer-package-session.handler';
import { RestorePackageTemplateHandler } from './application/commands/restore-package-template/restore-package-template.handler';
import { SoftDeleteCustomerPackageHandler } from './application/commands/soft-delete-customer-package/soft-delete-customer-package.handler';
import { SoftDeletePackageTemplateHandler } from './application/commands/soft-delete-package-template/soft-delete-package-template.handler';
import { UpdatePackageTemplateHandler } from './application/commands/update-package-template/update-package-template.handler';
import {
  CustomerPackageReadModelMapper,
  PackageTemplateReadModelMapper,
} from './application/mappers';
import { GetCustomerPackageByIdHandler } from './application/queries/get-customer-package-by-id/get-customer-package-by-id.handler';
import { GetPackageTemplateByIdHandler } from './application/queries/get-package-template-by-id/get-package-template-by-id.handler';
import { ListCustomerPackagesByCustomerHandler } from './application/queries/list-customer-packages-by-customer/list-customer-packages-by-customer.handler';
import { ListCustomerPackagesHandler } from './application/queries/list-customer-packages/list-customer-packages.handler';
import { ListPackageTemplatesHandler } from './application/queries/list-package-templates/list-package-templates.handler';
import {
  CUSTOMER_PACKAGE_REPOSITORY,
  PACKAGE_TEMPLATE_REPOSITORY,
} from './domain/tokens';
import {
  CustomerPackageMikroOrmEntity,
  PackageTemplateMikroOrmEntity,
} from './infrastructure/persistence/entities';
import {
  CustomerPackagePersistenceMapper,
  PackageTemplatePersistenceMapper,
} from './infrastructure/persistence/mappers';
import { CustomerPackageMikroOrmRepository } from './infrastructure/persistence/repositories/customer-package-mikro-orm.repository';
import { PackageTemplateMikroOrmRepository } from './infrastructure/persistence/repositories/package-template-mikro-orm.repository';
import { PackagesController } from './presentation/packages.controller';

const CommandHandlers = [
  CreatePackageTemplateHandler,
  UpdatePackageTemplateHandler,
  ActivatePackageTemplateHandler,
  DeactivatePackageTemplateHandler,
  SoftDeletePackageTemplateHandler,
  RestorePackageTemplateHandler,
  CreateCustomerPackageHandler,
  ConsumeCustomerPackageSessionHandler,
  RestoreCustomerPackageSessionHandler,
  MarkCustomerPackagePaidHandler,
  MarkCustomerPackageUnpaidHandler,
  ExpireCustomerPackageHandler,
  CancelCustomerPackageHandler,
  ExtendCustomerPackageHandler,
  SoftDeleteCustomerPackageHandler,
  RestoreCustomerPackageHandler,
];

const QueryHandlers = [
  ListPackageTemplatesHandler,
  GetPackageTemplateByIdHandler,
  ListCustomerPackagesHandler,
  ListCustomerPackagesByCustomerHandler,
  GetCustomerPackageByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    CustomersModule,
    MikroOrmModule.forFeature([
      PackageTemplateMikroOrmEntity,
      CustomerPackageMikroOrmEntity,
    ]),
  ],
  controllers: [PackagesController],
  providers: [
    PackageTemplatePersistenceMapper,
    CustomerPackagePersistenceMapper,
    PackageTemplateReadModelMapper,
    CustomerPackageReadModelMapper,
    {
      provide: PACKAGE_TEMPLATE_REPOSITORY,
      useClass: PackageTemplateMikroOrmRepository,
    },
    {
      provide: CUSTOMER_PACKAGE_REPOSITORY,
      useClass: CustomerPackageMikroOrmRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    PACKAGE_TEMPLATE_REPOSITORY,
    CUSTOMER_PACKAGE_REPOSITORY,
    PackageTemplateReadModelMapper,
    CustomerPackageReadModelMapper,
    CqrsModule,
  ],
})
export class PackagesModule {}
