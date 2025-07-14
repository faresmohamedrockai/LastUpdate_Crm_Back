import { Injectable, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';
import { Role } from '@prisma/client';

@Injectable()
export class DevelopersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) {}

  async createDeveloper(dto: CreateDeveloperDto, userId: string, userName: string, userRole: string) {
    // Check if developer with same name already exists
    const existingDeveloper = await this.prisma.developer.findFirst({
      where: { name: dto.name },
    });

    if (existingDeveloper) {
      throw new ConflictException('Developer with this name already exists');
    }

    try {
      const developer = await this.prisma.developer.create({
        data: {
          name: dto.name,
          description: dto.description,
          contact: dto.contact,
          website: dto.website,
          logo: dto.logo,
        },
      });

      await this.logsService.createLog({
        action: 'CREATE',
        userId,
        userName,
        userRole,
        description: `Created developer: name=${developer.name}, contact=${developer.contact}`,
      });

      return developer;
    } catch (error) {
      throw new HttpException('Failed to create developer', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(userId: string, userName: string, userRole: string) {
    try {
      const developers = await this.prisma.developer.findMany({
        orderBy: { id: 'desc' },
        include: {
          projects: {
            include: {
              inventories: {
                include: {
                  leads: true,
                  visits: true,
                },
              },
            },
          },
        },
      });

      await this.logsService.createLog({
        action: 'READ',
        userId,
        userName,
        userRole,
        description: `Retrieved all developers: count=${developers.length}`,
      });

      return developers;
    } catch (error) {
      throw new HttpException('Failed to retrieve developers', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDeveloperById(id: string, userId: string, userName: string, userRole: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            inventories: {
              include: {
                leads: true,
                visits: true,
              },
            },
            zone: true,
          },
        },
      },
    });

    if (!developer) {
      throw new NotFoundException('Developer not found');
    }

    // Log developer retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_developer_by_id',
      description: `Retrieved developer: id=${id}, name=${developer.name}`,
    });

    return developer;
  }

  async updateDeveloper(id: string, dto: UpdateDeveloperDto, userId: string, userName: string, userRole: string) {
    const existingDeveloper = await this.prisma.developer.findUnique({ where: { id } });
    if (!existingDeveloper) {
      throw new NotFoundException('Developer not found');
    }

    // Check if name is being changed and if it conflicts with another developer
    if (dto.name && dto.name !== existingDeveloper.name) {
      const nameExists = await this.prisma.developer.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (nameExists) {
        throw new ConflictException('Developer with this name already exists');
      }
    }

    const updatedDeveloper = await this.prisma.developer.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.contact && { contact: dto.contact }),
        ...(dto.website && { website: dto.website }),
        ...(dto.logo && { logo: dto.logo }),
      },
      include: {
        projects: {
          include: {
            inventories: true,
          },
        },
      },
    });

    // Log developer update
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'update_developer',
      description: `Updated developer: id=${id}, name=${updatedDeveloper.name}`,
    });

    return {
      status: 200,
      message: 'Developer updated successfully',
      data: updatedDeveloper,
    };
  }

  async deleteDeveloper(id: string, userId: string, userName: string, userRole: string) {
    const existingDeveloper = await this.prisma.developer.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            inventories: true,
          },
        },
      },
    });
    
    if (!existingDeveloper) {
      throw new NotFoundException('Developer not found');
    }

    // Check if developer has projects with inventories
    const hasInventories = existingDeveloper.projects.some(project => project.inventories.length > 0);
    if (hasInventories) {
      throw new ConflictException('Cannot delete developer with existing projects that have inventories');
    }

    await this.prisma.developer.delete({ where: { id } });

    // Log developer deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_developer',
      description: `Deleted developer: id=${id}, name=${existingDeveloper.name}`,
    });

    return {
      status: 200,
      message: 'Developer deleted successfully',
    };
  }

  async getDevelopersWithStats(userId: string, userName: string, userRole: string) {
    const developers = await this.prisma.developer.findMany({
      include: {
        projects: {
          include: {
            inventories: {
              include: {
                leads: true,
                visits: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    const developersWithStats = developers.map(developer => {
      const totalProjects = developer.projects.length;
      const totalInventories = developer.projects.reduce((sum, project) => sum + project.inventories.length, 0);
      const totalLeads = developer.projects.reduce((sum, project) => 
        sum + project.inventories.reduce((invSum, inv) => invSum + inv.leads.length, 0), 0);
      const totalVisits = developer.projects.reduce((sum, project) => 
        sum + project.inventories.reduce((invSum, inv) => invSum + inv.visits.length, 0), 0);

      return {
        ...developer,
        stats: {
          totalProjects,
          totalInventories,
          totalLeads,
          totalVisits,
        },
      };
    });

    // Log developers stats retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_developers_with_stats',
      description: `Retrieved ${developersWithStats.length} developers with statistics`,
    });

    return developersWithStats;
  }

  async getAllDevelopers(userId: string, userName: string, userRole: Role) {
    try {
      const developers = await this.prisma.developer.findMany({
        orderBy: { id: 'desc' },
        include: {
          projects: {
            include: {
              inventories: {
                include: {
                  leads: true,
                  visits: true,
                },
              },
            },
          },
        },
      });

      await this.logsService.createLog({
        action: 'READ',
        userId,
        userName,
        userRole,
        description: `Retrieved all developers: count=${developers.length}`,
      });

      return developers;
    } catch (error) {
      throw new HttpException('Failed to retrieve developers', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 