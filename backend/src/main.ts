import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const configuredOrigins = (
    process.env.FRONTEND_URLS ??
    process.env.FRONTEND_URL ??
    'https://icapital-9r908mpwh-ashenafibizukork-gmailcoms-projects.vercel.app'
  )
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)
    .map((origin) => {
      try {
        return new URL(origin).origin;
      } catch {
        throw new Error(`Invalid frontend origin: ${origin}`);
      }
    });

  app.enableCors({
    origin: configuredOrigins,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
