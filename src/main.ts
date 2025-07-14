import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
 app.use(cookieParser());
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
      forbidNonWhitelisted: false, 
      transform: true,             
    }),
  );

  await app.listen(3000);
}
bootstrap();
