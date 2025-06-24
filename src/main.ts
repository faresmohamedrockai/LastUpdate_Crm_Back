import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove extra fields not in DTO
      forbidNonWhitelisted: true, // throw error if extra fields exist
      transform: true, // transform input to correct types
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
