import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 app.use(morgan("dev"))
app.enableCors({
  origin: ['http://192.168.1.39:5173'], 
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

  await app.listen(5173);
}
bootstrap();
