import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma:PrismaService
  ){}
  async createProject(dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: dto,
    });
    return { message: 'Project created', data: project };
  }

  async updateProject(id: string, dto: UpdateProjectDto) {
    const exists = await this.prisma.project.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Project not found');

    const updated = await this.prisma.project.update({
      where: { id },
      data: dto,
    });

    return { message: 'Project updated', data: updated };
  }

  async deleteProject(id: string) {
    const exists = await this.prisma.project.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Project not found');

    await this.prisma.project.delete({ where: { id } });

    return { message: 'Project deleted successfully' };
  }

  async getAllProjectsWithInventories() {
    const data = await this.prisma.project.findMany({
      include: {
        inventories: true, 
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(project => ({
      ...project,
      inventories: project.inventories.map(inv => ({
        ...inv,
        images: inv.images? JSON.parse(inv.images) : [], 
      })),
    }));
  }


async getProjectById(id: string) {
  const project = await this.prisma.project.findUnique({
    where: { id },
    include: {
      inventories: true, // يجلب العقارات المرتبطة
    },
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

return {
  status: 200,
  data: {
    ...project,
    inventories: project.inventories.map((inv) => ({
      ...inv,
      images: inv.images ? JSON.parse(inv.images) : [],
    })),
  },
};

}



}
