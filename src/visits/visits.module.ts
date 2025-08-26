import { Module } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LogsModule } from '../logs/logs.module';
import { MeetingsModule } from 'src/meetings/meetings.module';
@Module({
  imports:[PrismaModule, LogsModule,MeetingsModule],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
