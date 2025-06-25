import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports:[PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService,CloudinaryService],
})
export class InventoryModule {}
