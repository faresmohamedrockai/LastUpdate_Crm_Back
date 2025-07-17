import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LogsModule } from '../logs/logs.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [PrismaModule, LogsModule],
  controllers: [InventoryController],
  providers: [InventoryService,CloudinaryService],
  exports: [InventoryService],
})
export class InventoryModule {}
