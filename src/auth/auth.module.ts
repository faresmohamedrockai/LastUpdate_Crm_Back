import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy'; 
import { LogsModule } from '../logs/logs.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MulterModule } from '@nestjs/platform-express';
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
    }),
    LogsModule,
     MulterModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService , JwtStrategy,CloudinaryService], 
  exports: [AuthService,JwtStrategy], 
})
export class AuthModule {}
