import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LeadsModule } from './leads/leads.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProjectsModule } from './projects/projects.module';
@Module({
  imports: [AuthModule,ConfigModule.forRoot({isGlobal:true}), LeadsModule, InventoryModule, ProjectsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
