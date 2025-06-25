import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LeadsModule } from './leads/leads.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProjectsModule } from './projects/projects.module';
import { CallsModule } from './calls/calls.module';
import { VisitsModule } from './visits/visits.module';
@Module({
  imports: [AuthModule,ConfigModule.forRoot({isGlobal:true}), LeadsModule, InventoryModule, ProjectsModule, CallsModule, VisitsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
