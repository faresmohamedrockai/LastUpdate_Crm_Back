// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { CallsModule } from './calls/calls.module';
import { VisitsModule } from './visits/visits.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProjectsModule } from './projects/projects.module';
import { DevelopersModule } from './developers/developers.module';
import { ZonesModule } from './zones/zones.module';
import { LogsModule } from './logs/logs.module';
import { MeetingsModule } from './meetings/meetings.module';
import { ContractsModule } from './contracts/contracts.module';
import { TasksModule } from './tasks/tasks.module';
import { EmailModule } from './email/email.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UserCheckMiddleware } from './common/middelwares/UserCheckMiddleware ';
import { ScheduleModule } from '@nestjs/schedule';
// import { AiModule } from './ai/ai.module';
import { AiModule } from './ai/ai.module';
import { TransferService } from './transfer/transfer.service';
import { TransferModule } from './transfer/transfer.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
       ScheduleModule.forRoot(),
    JwtModule.register({ secret: process.env.JWT_SECRET }), // لازم تسجله
    AuthModule,
    LeadsModule,
    CallsModule,
    VisitsModule,
    InventoryModule,
    ProjectsModule,
    DevelopersModule,
    ZonesModule,
    PrismaModule,
    LogsModule,
    MeetingsModule,
    ContractsModule,
    TasksModule,
    EmailModule,
    SchedulerModule,
    MulterModule.register({}),
    AiModule,
    TransferModule,
    // AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, TransferService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserCheckMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        // { path: 'auth/add-user', method: RequestMethod.POST },
       
     
       
      
      )
      .forRoutes('*');
  }
}
