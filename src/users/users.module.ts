import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '@auth/auth.module';
import { CqrsModule } from '@common/application/cqrs';
import { ChangeUserAvatarUrlHandler } from './application/commands/change-user-avatar-url/change-user-avatar-url.handler';
import { ChangeUserDisplayNameHandler } from './application/commands/change-user-display-name/change-user-display-name.handler';
import { ChangeUserStatusHandler } from './application/commands/change-user-status/change-user-status.handler';
import { ChangeUserSubscriptionStatusHandler } from './application/commands/change-user-subscription-status/change-user-subscription-status.handler';
import { ChangeUserTimezoneHandler } from './application/commands/change-user-timezone/change-user-timezone.handler';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { RecordUserLoginHandler } from './application/commands/record-user-login/record-user-login.handler';
import { RenameUserHandler } from './application/commands/rename-user/rename-user.handler';
import { RestoreUserHandler } from './application/commands/restore-user/restore-user.handler';
import { SoftDeleteUserHandler } from './application/commands/soft-delete-user/soft-delete-user.handler';
import { VerifyUserEmailHandler } from './application/commands/verify-user-email/verify-user-email.handler';
import { UserReadModelMapper } from './application/mappers';
import { GetUserByDisplayNameHandler } from './application/queries/get-user-by-display-name/get-user-by-display-name.handler';
import { GetUserByEmailHandler } from './application/queries/get-user-by-email/get-user-by-email.handler';
import { GetUserByIdHandler } from './application/queries/get-user-by-id/get-user-by-id.handler';
import { ListUsersHandler } from './application/queries/list-users/list-users.handler';
import { USER_REPOSITORY } from './domain/tokens';
import { UserMikroOrmEntity } from './infrastructure/persistence/entities';
import { UserPersistenceMapper } from './infrastructure/persistence/mappers/user.persistence-mapper';
import { UserMikroOrmRepository } from './infrastructure/persistence/repositories/user-mikro-orm.repository';
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
];

const QueryHandlers = [
  GetUserByIdHandler,
  GetUserByEmailHandler,
  GetUserByDisplayNameHandler,
  ListUsersHandler,
];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    MikroOrmModule.forFeature([UserMikroOrmEntity]),
  ],
  controllers: [UsersController],
  providers: [
    UserPersistenceMapper,
    UserReadModelMapper,
    {
      provide: USER_REPOSITORY,
      useClass: UserMikroOrmRepository,
    },

    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [USER_REPOSITORY, UserReadModelMapper, CqrsModule],
})
export class UsersModule {}
