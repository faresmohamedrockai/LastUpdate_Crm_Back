import { Module } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({imports:[PrismaModule],
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}
