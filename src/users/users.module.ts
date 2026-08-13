import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '@auth/auth.module';
import { CqrsModule } from '@common/application/cqrs';
import { IntegrationTokenCipherService } from '@common/crypto';
import { ConnectUserIntegrationHandler } from './application/commands/connect-user-integration/connect-user-integration.handler';
import { ChangeUserAvatarUrlHandler } from './application/commands/change-user-avatar-url/change-user-avatar-url.handler';
import { ChangeUserDisplayNameHandler } from './application/commands/change-user-display-name/change-user-display-name.handler';
import { ChangeUserProfileAiHandler } from './application/commands/change-user-profile-ai/change-user-profile-ai.handler';
import { ChangeUserProfileDetailsHandler } from './application/commands/change-user-profile-details/change-user-profile-details.handler';
import { ChangeUserProfileLocationsHandler } from './application/commands/change-user-profile-locations/change-user-profile-locations.handler';
import { ChangeUserProfilePaymentsHandler } from './application/commands/change-user-profile-payments/change-user-profile-payments.handler';
import { ChangeUserProfilePricingHandler } from './application/commands/change-user-profile-pricing/change-user-profile-pricing.handler';
import { ChangeUserProfileSportsHandler } from './application/commands/change-user-profile-sports/change-user-profile-sports.handler';
import { ChangeUserStatusHandler } from './application/commands/change-user-status/change-user-status.handler';
import { ChangeUserSubscriptionStatusHandler } from './application/commands/change-user-subscription-status/change-user-subscription-status.handler';
import { ChangeUserTimezoneHandler } from './application/commands/change-user-timezone/change-user-timezone.handler';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { CreateUserProfileHandler } from './application/commands/create-user-profile/create-user-profile.handler';
import { DisconnectUserIntegrationHandler } from './application/commands/disconnect-user-integration/disconnect-user-integration.handler';
import { HandleIntegrationOAuthCallbackHandler } from './application/commands/handle-integration-oauth-callback/handle-integration-oauth-callback.handler';
import { MarkUserIntegrationErrorHandler } from './application/commands/mark-user-integration-error/mark-user-integration-error.handler';
import { MarkUserIntegrationExpiredHandler } from './application/commands/mark-user-integration-expired/mark-user-integration-expired.handler';
import { RecordUserIntegrationSyncHandler } from './application/commands/record-user-integration-sync/record-user-integration-sync.handler';
import { RecordUserLoginHandler } from './application/commands/record-user-login/record-user-login.handler';
import { RestoreUserIntegrationHandler } from './application/commands/restore-user-integration/restore-user-integration.handler';
import { RevokeUserIntegrationHandler } from './application/commands/revoke-user-integration/revoke-user-integration.handler';
import { RenameUserHandler } from './application/commands/rename-user/rename-user.handler';
import { RestoreUserHandler } from './application/commands/restore-user/restore-user.handler';
import { SoftDeleteUserHandler } from './application/commands/soft-delete-user/soft-delete-user.handler';
import { StartIntegrationOAuthHandler } from './application/commands/start-integration-oauth/start-integration-oauth.handler';
import { SoftDeleteUserIntegrationHandler } from './application/commands/soft-delete-user-integration/soft-delete-user-integration.handler';
import { SoftDeleteUserProfileHandler } from './application/commands/soft-delete-user-profile/soft-delete-user-profile.handler';
import { UpdateUserIntegrationSettingsHandler } from './application/commands/update-user-integration-settings/update-user-integration-settings.handler';
import { UpdateUserIntegrationTokensHandler } from './application/commands/update-user-integration-tokens/update-user-integration-tokens.handler';
import { VerifyUserEmailHandler } from './application/commands/verify-user-email/verify-user-email.handler';
import {
  UserIntegrationReadModelMapper,
  UserProfileReadModelMapper,
  UserReadModelMapper,
} from './application/mappers';
import { GetUserIntegrationByProviderHandler } from './application/queries/get-user-integration-by-provider/get-user-integration-by-provider.handler';
import { GetUserByDisplayNameHandler } from './application/queries/get-user-by-display-name/get-user-by-display-name.handler';
import { GetUserByEmailHandler } from './application/queries/get-user-by-email/get-user-by-email.handler';
import { GetUserByIdHandler } from './application/queries/get-user-by-id/get-user-by-id.handler';
import { GetUserProfileByIdHandler } from './application/queries/get-user-profile-by-id/get-user-profile-by-id.handler';
import { GetUserProfileByUserIdHandler } from './application/queries/get-user-profile-by-user-id/get-user-profile-by-user-id.handler';
import { ListUserIntegrationsHandler } from './application/queries/list-user-integrations/list-user-integrations.handler';
import { ListUsersHandler } from './application/queries/list-users/list-users.handler';
import { USER_INTEGRATION_REPOSITORY, USER_PROFILE_REPOSITORY, USER_REPOSITORY } from './domain/tokens';
import {
  UserIntegrationMikroOrmEntity,
  UserMikroOrmEntity,
  UserProfileMikroOrmEntity,
} from './infrastructure/persistence/entities';
import { UserPersistenceMapper } from './infrastructure/persistence/mappers/user.persistence-mapper';
import { UserIntegrationPersistenceMapper } from './infrastructure/persistence/mappers/user-integration.persistence-mapper';
import { UserProfilePersistenceMapper } from './infrastructure/persistence/mappers/user-profile.persistence-mapper';
import { UserIntegrationMikroOrmRepository } from './infrastructure/persistence/repositories/user-integration-mikro-orm.repository';
import { UserMikroOrmRepository } from './infrastructure/persistence/repositories/user-mikro-orm.repository';
import { UserProfileMikroOrmRepository } from './infrastructure/persistence/repositories/user-profile-mikro-orm.repository';
import {
  GoogleCalendarOAuthClient,
  IntegrationOAuthClientRegistry,
  IntegrationOAuthStateStore,
  MetaInstagramOAuthClient,
  MetaWhatsAppOAuthClient,
} from './infrastructure/oauth';
import { IntegrationOAuthController } from './presentation/integration-oauth.controller';
import { UserIntegrationsController } from './presentation/user-integrations.controller';
import { UserProfilesController } from './presentation/user-profiles.controller';
import { UsersController } from './presentation/users.controller';

const CommandHandlers = [
  CreateUserHandler,
  RenameUserHandler,
  ChangeUserDisplayNameHandler,
  ChangeUserAvatarUrlHandler,
  ChangeUserTimezoneHandler,
  ChangeUserStatusHandler,
  ChangeUserSubscriptionStatusHandler,
  VerifyUserEmailHandler,
  RecordUserLoginHandler,
  SoftDeleteUserHandler,
  RestoreUserHandler,
  CreateUserProfileHandler,
  ChangeUserProfileDetailsHandler,
  ChangeUserProfileSportsHandler,
  ChangeUserProfileLocationsHandler,
  ChangeUserProfilePricingHandler,
  ChangeUserProfilePaymentsHandler,
  ChangeUserProfileAiHandler,
  SoftDeleteUserProfileHandler,
  ConnectUserIntegrationHandler,
  DisconnectUserIntegrationHandler,
  RevokeUserIntegrationHandler,
  UpdateUserIntegrationSettingsHandler,
  UpdateUserIntegrationTokensHandler,
  SoftDeleteUserIntegrationHandler,
  RestoreUserIntegrationHandler,
  RecordUserIntegrationSyncHandler,
  MarkUserIntegrationExpiredHandler,
  MarkUserIntegrationErrorHandler,
  StartIntegrationOAuthHandler,
  HandleIntegrationOAuthCallbackHandler,
];

const QueryHandlers = [
  GetUserByIdHandler,
  GetUserByEmailHandler,
  GetUserByDisplayNameHandler,
  ListUsersHandler,
  GetUserProfileByIdHandler,
  GetUserProfileByUserIdHandler,
  ListUserIntegrationsHandler,
  GetUserIntegrationByProviderHandler,
];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    MikroOrmModule.forFeature([
      UserMikroOrmEntity,
      UserProfileMikroOrmEntity,
      UserIntegrationMikroOrmEntity,
    ]),
  ],
  controllers: [
    UsersController,
    UserProfilesController,
    UserIntegrationsController,
    IntegrationOAuthController,
  ],
  providers: [
    IntegrationTokenCipherService,
    IntegrationOAuthStateStore,
    GoogleCalendarOAuthClient,
    MetaInstagramOAuthClient,
    MetaWhatsAppOAuthClient,
    IntegrationOAuthClientRegistry,
    UserPersistenceMapper,
    UserProfilePersistenceMapper,
    UserIntegrationPersistenceMapper,
    UserReadModelMapper,
    UserProfileReadModelMapper,
    UserIntegrationReadModelMapper,
    {
      provide: USER_REPOSITORY,
      useClass: UserMikroOrmRepository,
    },
    {
      provide: USER_PROFILE_REPOSITORY,
      useClass: UserProfileMikroOrmRepository,
    },
    {
      provide: USER_INTEGRATION_REPOSITORY,
      useClass: UserIntegrationMikroOrmRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    USER_REPOSITORY,
    USER_PROFILE_REPOSITORY,
    USER_INTEGRATION_REPOSITORY,
    UserReadModelMapper,
    UserProfileReadModelMapper,
    UserIntegrationReadModelMapper,
    CqrsModule,
  ],
})
export class UsersModule {}
