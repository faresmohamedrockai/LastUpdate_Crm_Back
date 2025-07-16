import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private readonly logsService: LogsService,
  ) {}

  async createProject(dto: CreateProjectDto, userId: string, userName: string, userRole: string) {
    // Validate developer exists if provided
    if (dto.developerId) {
      const developer = await this.prisma.developer.findUnique({
        where: { id: dto.developerId },
      });
      if (!developer) {
        throw new NotFoundException('Developer not found');
      }
    }

    // Validate zone exists if provided
    if (dto.zoneId) {
      const zone = await this.prisma.zone.findUnique({
        where: { id: dto.zoneId },
      });
      if (!zone) {
        throw new NotFoundException('Zone not found');
      }
    }

    // Check if project with same name already exists
    const existingProject = await this.prisma.project.findFirst({
      where: { nameEn: dto.nameEn },
    });

    if (existingProject) {
      throw new ConflictException('Project with this name already exists');
    }

const project = await this.prisma.project.create({
  data: {
    nameEn: dto.nameEn,
    nameAr: dto.nameAr ?? null, // null إذا undefined
    location: dto.location,
    description: dto.description ?? null,
    images: dto.images ? JSON.stringify(dto.images) : null,
    developerId: dto.developerId ?? null,
    zoneId: dto.zoneId ?? null,
    type: 'residential', // أو أي قيمة افتراضية عندك لـ type
  },
  include: {
    developer: true,
    zone: true,
    inventories: true,
    paymentPlans: true,
  },
});





    // Log project creation
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'create_project',
      description: `Created project: name=${project.nameEn}, location=${project.location}, `,
    });

    return { 
      status: 201,
      message: 'Project created successfully', 
      data: {
        ...project,
        images: project.images ? JSON.parse(project.images) : [],
      }
    };
  }

  async getAllProjects(userId: string, userName: string, userRole: string) {
    const data = await this.prisma.project.findMany({
      include: {
        inventories: true,
        developer: true,
        zone: true,
        paymentPlans : true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log projects retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_all_projects',
      description: `Retrieved ${data.length} projects`,
    });

    return data.map(project => ({
      ...project,
      images: project.images ? JSON.parse(project.images) : [],
      inventories: project.inventories.map(inv => ({
        ...inv,
        images: inv.images ? JSON.parse(inv.images) : [],
      })),
    }));
  }

  async getProjectById(id: string, userId: string, userName: string, userRole: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        inventories: {
          include: {
            leads: true,
            visits: true,
          }
        },
        developer: true,
        zone: true,
        paymentPlans : true,
        calls: true,
        meetings: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Log project retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_project_by_id',
      description: `Retrieved project: id=${id}, name=${project.nameEn}, location=${project.location}`,
    });

    return {
      status: 200,
      data: {
        ...project,
        images: project.images ? JSON.parse(project.images) : [],
        inventories: project.inventories.map((inv) => ({
          ...inv,
          images: inv.images ? JSON.parse(inv.images) : [],
        })),
      },
    };
  }

  async updateProject(id: string, dto: UpdateProjectDto, userId: string, userName: string, userRole: string) {
    const exists = await this.prisma.project.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Project not found');

    // Validate developer exists if provided
    if (dto.developerId) {
      const developer = await this.prisma.developer.findUnique({
        where: { id: dto.developerId },
      });
      if (!developer) {
        throw new NotFoundException('Developer not found');
      }
    }

    // Validate zone exists if provided
    if (dto.zoneId) {
      const zone = await this.prisma.zone.findUnique({
        where: { id: dto.zoneId },
      });
      if (!zone) {
        throw new NotFoundException('Zone not found');
      }
    }

    // Check if name is being changed and if it conflicts with another project
    if (dto.nameEn && dto.nameEn !== exists.nameEn) {
      const nameExists = await this.prisma.project.findFirst({
        where: { nameEn: dto.nameEn, id: { not: id } },
      });
      if (nameExists) {
        throw new ConflictException('Project with this name already exists');
      }
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.nameEn && { nameEn: dto.nameEn }),
        ...(dto.nameAr && { nameAr: dto.nameAr }),
        ...(dto.location && { location: dto.location }),
        ...(dto.description && { description: dto.description }),
        ...(dto.images && { images: JSON.stringify(dto.images) }),
        ...(dto.developerId && { developerId: dto.developerId }),
        ...(dto.zoneId && { zoneId: dto.zoneId }),
      },
      include: {
        developer: true,
        zone: true,
        inventories: true,
        paymentPlans : true,
      },
    });

    // Log project update
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'update_project',
      description: `Updated project: id=${id}, name=${updated.nameEn}, location=${updated.location}`,
    });

    return { 
      status: 200,
      message: 'Project updated successfully', 
      data: {
        ...updated,
        images: updated.images ? JSON.parse(updated.images) : [],
      }
    };
  }

  async deleteProject(id: string, userId: string, userName: string, userRole: string) {
    const exists = await this.prisma.project.findUnique({ 
      where: { id },
      include: { inventories: true }
    });
    if (!exists) throw new NotFoundException('Project not found');

    // Check if project has inventories
    if (exists.inventories.length > 0) {
      throw new ConflictException('Cannot delete project with existing inventories');
    }

    await this.prisma.project.delete({ where: { id } });

    // Log project deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_project',
      description: `Deleted project: id=${id}, name=${exists.nameEn}`,
    });

    return { 
      status: 200,
      message: 'Project deleted successfully' 
    };
  }

  async getProjectsByDeveloper(developerId: string, userId: string, userName: string, userRole: string) {
    const projects = await this.prisma.project.findMany({
      where: { developerId },
      include: {
        inventories: true,
        zone: true,
        paymentPlans : true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log projects retrieval by developer
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_projects_by_developer',
      description: `Retrieved ${projects.length} projects for developer: ${developerId}`,
    });

    return projects.map(project => ({
      ...project,
      images: project.images ? JSON.parse(project.images) : [],
      inventories: project.inventories.map(inv => ({
        ...inv,
        images: inv.images ? JSON.parse(inv.images) : [],
      })),
    }));
  }

  async getProjectsByZone(zoneId: string, userId: string, userName: string, userRole: string) {
    const projects = await this.prisma.project.findMany({
      where: { zoneId },
      include: {
        inventories: true,
        developer: true,
        paymentPlans : true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log projects retrieval by zone
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_projects_by_zone',
      description: `Retrieved ${projects.length} projects for zone: ${zoneId}`,
    });

    return projects.map(project => ({
      ...project,
      images: project.images ? JSON.parse(project.images) : [],
      inventories: project.inventories.map(inv => ({
        ...inv,
        images: inv.images ? JSON.parse(inv.images) : [],
      })),
    }));
  }
}
