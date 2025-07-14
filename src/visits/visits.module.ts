import { Module } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports:[PrismaModule, LogsModule],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
