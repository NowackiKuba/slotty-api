import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@common/application/cqrs';
import { DevLoginHandler } from '@auth/application/commands/dev-login/dev-login.handler';
import { LogoutHandler } from '@auth/application/commands/logout/logout.handler';
import { RefreshTokenHandler } from '@auth/application/commands/refresh-token/refresh-token.handler';
import { SocialLoginHandler } from '@auth/application/commands/social-login/social-login.handler';
import { AuthSessionReadModelMapper } from '@auth/application/mappers';
import { AUTH_IDENTITY_REPOSITORY } from '@auth/domain/tokens';
import { AuthIdentityPersistenceMapper } from '@auth/infrastructure/mappers/auth-identity.persistence-mapper';
import { AuthIdentityMikroOrmEntity } from '@auth/infrastructure/persistence/auth-identity-mikro-orm.entity';
import { AppleTokenVerifier } from '@auth/infrastructure/providers/apple-token.verifier';
import { GoogleTokenVerifier } from '@auth/infrastructure/providers/google-token.verifier';
import { AuthIdentityMikroOrmRepository } from '@auth/infrastructure/repositories/auth-identity-mikro-orm.repository';
import { RefreshTokenStore } from '@auth/infrastructure/tokens/refresh-token.store';
import { TokenService } from '@auth/infrastructure/tokens/token.service';
import { AuthController } from '@auth/presentation/auth.controller';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
import { RedisModule } from '@common/redis/redis.module';
import { UsersModule } from '@users/users.module';

const CommandHandlers = [
  DevLoginHandler,
  SocialLoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => UsersModule),
    RedisModule,
    MikroOrmModule.forFeature([AuthIdentityMikroOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthIdentityPersistenceMapper,
    AuthSessionReadModelMapper,
    {
      provide: AUTH_IDENTITY_REPOSITORY,
      useClass: AuthIdentityMikroOrmRepository,
    },
    GoogleTokenVerifier,
    AppleTokenVerifier,
    RefreshTokenStore,
    TokenService,
    JwtAuthGuard,
    ...CommandHandlers,
  ],
  exports: [TokenService, JwtAuthGuard],
})
export class AuthModule {}
