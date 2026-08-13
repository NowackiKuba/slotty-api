import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '@auth/auth.module';
import { CqrsModule } from '@common/application/cqrs';
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
import { RecordUserLoginHandler } from './application/commands/record-user-login/record-user-login.handler';
import { RenameUserHandler } from './application/commands/rename-user/rename-user.handler';
import { RestoreUserHandler } from './application/commands/restore-user/restore-user.handler';
import { SoftDeleteUserHandler } from './application/commands/soft-delete-user/soft-delete-user.handler';
import { SoftDeleteUserProfileHandler } from './application/commands/soft-delete-user-profile/soft-delete-user-profile.handler';
import { VerifyUserEmailHandler } from './application/commands/verify-user-email/verify-user-email.handler';
import {
  UserProfileReadModelMapper,
  UserReadModelMapper,
} from './application/mappers';
import { GetUserByDisplayNameHandler } from './application/queries/get-user-by-display-name/get-user-by-display-name.handler';
import { GetUserByEmailHandler } from './application/queries/get-user-by-email/get-user-by-email.handler';
import { GetUserByIdHandler } from './application/queries/get-user-by-id/get-user-by-id.handler';
import { GetUserProfileByIdHandler } from './application/queries/get-user-profile-by-id/get-user-profile-by-id.handler';
import { GetUserProfileByUserIdHandler } from './application/queries/get-user-profile-by-user-id/get-user-profile-by-user-id.handler';
import { ListUsersHandler } from './application/queries/list-users/list-users.handler';
import { USER_PROFILE_REPOSITORY, USER_REPOSITORY } from './domain/tokens';
import {
  UserMikroOrmEntity,
  UserProfileMikroOrmEntity,
} from './infrastructure/persistence/entities';
import { UserPersistenceMapper } from './infrastructure/persistence/mappers/user.persistence-mapper';
import { UserProfilePersistenceMapper } from './infrastructure/persistence/mappers/user-profile.persistence-mapper';
import { UserMikroOrmRepository } from './infrastructure/persistence/repositories/user-mikro-orm.repository';
import { UserProfileMikroOrmRepository } from './infrastructure/persistence/repositories/user-profile-mikro-orm.repository';
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
];

const QueryHandlers = [
  GetUserByIdHandler,
  GetUserByEmailHandler,
  GetUserByDisplayNameHandler,
  ListUsersHandler,
  GetUserProfileByIdHandler,
  GetUserProfileByUserIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    MikroOrmModule.forFeature([UserMikroOrmEntity, UserProfileMikroOrmEntity]),
  ],
  controllers: [UsersController, UserProfilesController],
  providers: [
    UserPersistenceMapper,
    UserProfilePersistenceMapper,
    UserReadModelMapper,
    UserProfileReadModelMapper,
    {
      provide: USER_REPOSITORY,
      useClass: UserMikroOrmRepository,
    },
    {
      provide: USER_PROFILE_REPOSITORY,
      useClass: UserProfileMikroOrmRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    USER_REPOSITORY,
    USER_PROFILE_REPOSITORY,
    UserReadModelMapper,
    UserProfileReadModelMapper,
    CqrsModule,
  ],
})
export class UsersModule {}
