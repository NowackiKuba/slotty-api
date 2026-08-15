import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@common/application/cqrs';
import { DevLoginCommand } from '@auth/application/commands/dev-login/dev-login.command';
import { LogoutCommand } from '@auth/application/commands/logout/logout.command';
import { RefreshTokenCommand } from '@auth/application/commands/refresh-token/refresh-token.command';
import { SocialLoginCommand } from '@auth/application/commands/social-login/social-login.command';
import { GetUserByIdQuery } from '@users/application/queries/get-user-by-id/get-user-by-id.query';
import {
  CurrentUser,
  type CurrentUserPayload,
} from './decorators/current-user.decorator';
import { DevLoginDto } from './dto/dev-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('dev')
  @HttpCode(HttpStatus.OK)
  dev(@Body() body: DevLoginDto) {
    return this.commandBus.execute(
      new DevLoginCommand({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        displayName: body.displayName,
      }),
    );
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  google(@Body() body: SocialLoginDto) {
    return this.commandBus.execute(
      new SocialLoginCommand({
        provider: 'google',
        idToken: body.idToken,
        firstName: body.firstName,
        lastName: body.lastName,
        displayName: body.displayName,
      }),
    );
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  apple(@Body() body: SocialLoginDto) {
    return this.commandBus.execute(
      new SocialLoginCommand({
        provider: 'apple',
        idToken: body.idToken,
        firstName: body.firstName,
        lastName: body.lastName,
        displayName: body.displayName,
      }),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: RefreshTokenDto) {
    return this.commandBus.execute(
      new RefreshTokenCommand({ refreshToken: body.refreshToken }),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() body: RefreshTokenDto) {
    return this.commandBus.execute(
      new LogoutCommand({ refreshToken: body.refreshToken }),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.queryBus.execute(new GetUserByIdQuery({ id: user.userId }));
  }
}
