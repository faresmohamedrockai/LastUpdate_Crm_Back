import { Module } from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { DevelopersController } from './developers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LogsModule } from '../logs/logs.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
@Module({
  imports: [PrismaModule, LogsModule],
  controllers: [DevelopersController],
  providers: [DevelopersService,CloudinaryService],
  exports: [DevelopersService],
})
export class DevelopersModule {} 