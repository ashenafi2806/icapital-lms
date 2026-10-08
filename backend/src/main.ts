import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: [
      'https://icapital-9r908mpwh-ashenafibizukork-gmailcoms-projects.vercel.app/login'
    ],
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
