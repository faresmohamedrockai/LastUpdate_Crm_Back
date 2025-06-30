import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 app.use(morgan("dev"))
  app.enableCors({
    origin: true,             
    credentials: true,        
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  
  app.setGlobalPrefix('api');

 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,             
      forbidNonWhitelisted: true, 
      transform: true,             
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
