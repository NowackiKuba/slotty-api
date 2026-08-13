import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainErrorMapper } from './common/exceptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new DomainErrorMapper());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
