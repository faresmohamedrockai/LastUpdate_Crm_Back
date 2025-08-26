import { Module } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TransferService } from './transfer.service';
import { LeadsModule } from 'src/leads/leads.module';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports:[TransferModule,PrismaModule,LeadsModule,AuthModule],
  controllers: [TransferController],
  providers:[TransferService],
  exports:[TransferService]
})
export class TransferModule {}
// sammar 1abf4521-8b5c-4277-8f7c-cc895dd30d13
// fares e801675b-19a5-4c06-97a8-b9ee8ba6502e
// leadId 3069b69c-823f-4d41-9c0e-3e61580d35b5