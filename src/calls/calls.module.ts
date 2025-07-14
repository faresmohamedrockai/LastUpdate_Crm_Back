import { Module } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LogsModule } from '../logs/logs.module';

@Module({imports:[PrismaModule, LogsModule],
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}
