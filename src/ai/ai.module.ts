import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { LeadsModule } from 'src/leads/leads.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports:[LeadsModule,ConfigModule],
  providers: [AiService],
  controllers: [AiController]
})
export class AiModule {}
