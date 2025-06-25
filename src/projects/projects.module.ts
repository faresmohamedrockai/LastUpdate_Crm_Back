import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectController } from './projects.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [ProjectController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
