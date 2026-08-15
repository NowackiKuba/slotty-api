import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from '@auth/auth.module';
import { CustomersModule } from '@customers/customers.module';
import { EventsModule } from '@events/events.module';
import { BroadcastsModule } from '@broadcasts/broadcasts.module';
import { MessagesModule } from '@messages/messages.module';
import { PackagesModule } from '@packages/packages.module';
import { UsersModule } from '@users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import mikroOrmConfig from './database/mikro-orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: Number(config.get<string>('REDIS_PORT', '6379')),
        },
      }),
    }),
    UsersModule,
    CustomersModule,
    EventsModule,
    MessagesModule,
    BroadcastsModule,
    PackagesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
