import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '@auth/auth.module';
import { CqrsModule } from '@common/application/cqrs';
import { ActivateCustomerHandler } from './application/commands/activate-customer/activate-customer.handler';
import { BlockCustomerHandler } from './application/commands/block-customer/block-customer.handler';
import { ChangeCustomerAiOptOutHandler } from './application/commands/change-customer-ai-opt-out/change-customer-ai-opt-out.handler';
import { ChangeCustomerAvatarUrlHandler } from './application/commands/change-customer-avatar-url/change-customer-avatar-url.handler';
import { ChangeCustomerEmailHandler } from './application/commands/change-customer-email/change-customer-email.handler';
import { ChangeCustomerNicknameHandler } from './application/commands/change-customer-nickname/change-customer-nickname.handler';
import { ChangeCustomerPhoneNumberHandler } from './application/commands/change-customer-phone-number/change-customer-phone-number.handler';
import { ChangeCustomerPreferredLanguageHandler } from './application/commands/change-customer-preferred-language/change-customer-preferred-language.handler';
import { ChangeCustomerSocialAccountsHandler } from './application/commands/change-customer-social-accounts/change-customer-social-accounts.handler';
import { ChangeCustomerTrainingNotesHandler } from './application/commands/change-customer-training-notes/change-customer-training-notes.handler';
import { CreateCustomerHandler } from './application/commands/create-customer/create-customer.handler';
import { DeactivateCustomerHandler } from './application/commands/deactivate-customer/deactivate-customer.handler';
import { RecordCustomerNoShowHandler } from './application/commands/record-customer-no-show/record-customer-no-show.handler';
import { RecordCustomerSessionHandler } from './application/commands/record-customer-session/record-customer-session.handler';
import { RenameCustomerHandler } from './application/commands/rename-customer/rename-customer.handler';
import { RestoreCustomerHandler } from './application/commands/restore-customer/restore-customer.handler';
import { SoftDeleteCustomerHandler } from './application/commands/soft-delete-customer/soft-delete-customer.handler';
import { UnblockCustomerHandler } from './application/commands/unblock-customer/unblock-customer.handler';
import { CustomerReadModelMapper } from './application/mappers';
import { GetCustomerByIdHandler } from './application/queries/get-customer-by-id/get-customer-by-id.handler';
import { ListCustomersHandler } from './application/queries/list-customers/list-customers.handler';
import { CUSTOMER_REPOSITORY } from './domain/tokens';
import { CustomerMikroOrmEntity } from './infrastructure/persistence/entities';
import { CustomerPersistenceMapper } from './infrastructure/persistence/mappers/customer.persistence-mapper';
import { CustomerMikroOrmRepository } from './infrastructure/persistence/repositories/customer-mikro-orm.repository';
import { CustomersController } from './presentation/customers.controller';

const CommandHandlers = [
  CreateCustomerHandler,
  RenameCustomerHandler,
  ChangeCustomerNicknameHandler,
  ChangeCustomerEmailHandler,
  ChangeCustomerPhoneNumberHandler,
  ChangeCustomerAvatarUrlHandler,
  ChangeCustomerSocialAccountsHandler,
  ChangeCustomerTrainingNotesHandler,
  ChangeCustomerAiOptOutHandler,
  ChangeCustomerPreferredLanguageHandler,
  ActivateCustomerHandler,
  DeactivateCustomerHandler,
  BlockCustomerHandler,
  UnblockCustomerHandler,
  RecordCustomerSessionHandler,
  RecordCustomerNoShowHandler,
  SoftDeleteCustomerHandler,
  RestoreCustomerHandler,
];

const QueryHandlers = [GetCustomerByIdHandler, ListCustomersHandler];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    MikroOrmModule.forFeature([CustomerMikroOrmEntity]),
  ],
  controllers: [CustomersController],
  providers: [
    CustomerPersistenceMapper,
    CustomerReadModelMapper,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerMikroOrmRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [CUSTOMER_REPOSITORY, CustomerReadModelMapper, CqrsModule],
})
export class CustomersModule {}
