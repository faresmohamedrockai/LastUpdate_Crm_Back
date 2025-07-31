import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskSchedulerService } from './task-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import * as crypto from 'crypto';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    EmailModule,
  ],
  providers: [TaskSchedulerService],
  exports: [TaskSchedulerService],
})
export class SchedulerModule {} 