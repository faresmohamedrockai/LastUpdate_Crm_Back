import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';

@Module({
  imports: [PrismaModule],
  providers: [LogsService],
  controllers: [LogsController],
  exports: [LogsService],
})
export class LogsModule {} 