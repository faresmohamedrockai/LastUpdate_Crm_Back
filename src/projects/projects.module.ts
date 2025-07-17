import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LogsModule } from '../logs/logs.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
@Module({
  imports: [PrismaModule, LogsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService,CloudinaryService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
