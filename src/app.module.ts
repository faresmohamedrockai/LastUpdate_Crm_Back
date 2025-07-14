import { Module } from '@nestjs/common';
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
import { PaymentPlansModule } from './payment-plans/payment-plans.module';
import { LogsModule } from './logs/logs.module';
import { MeetingsModule } from './meetings/meetings.module';
import { ContractsModule } from './contracts/contracts.module';
import { MulterModule } from '@nestjs/platform-express';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    LeadsModule,
    CallsModule,
    VisitsModule,
    InventoryModule,
    ProjectsModule,
    DevelopersModule,
    ZonesModule,
    PaymentPlansModule,
    LogsModule,
    MeetingsModule,
    ContractsModule,
     MulterModule.register({}), 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
