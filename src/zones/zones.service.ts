import { Injectable, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';

@Injectable()
export class ZonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) {}

  async createZone(dto: CreateZoneDto, userId: string, userName: string, userRole: string) {
    try {
      const zone = await this.prisma.zone.create({
        data: {
          name: dto.name,
          description: dto.description,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      });

      await this.logsService.createLog({
        action: 'CREATE',
        userId,
        userName,
        userRole,
        description: `Created zone: name=${zone.name}, latitude=${zone.latitude}, longitude=${zone.longitude}`,
      });

      return zone;
    } catch (error) {
      throw new HttpException('Failed to create zone', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllZones(userId: string, userName: string, userRole: string) {
    const zones = await this.prisma.zone.findMany({
      include: {
        projects: {
          include: {
            inventories: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    // Log zones retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_all_zones',
      description: `Retrieved ${zones.length} zones`,
    });

    return zones;
  }

  async getZoneById(id: string, userId: string, userName: string, userRole: string) {
    const zone = await this.prisma.zone.findUnique({
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
            developer: true,
          },
        },
      },
    });

    if (!zone) {
      throw new NotFoundException('Zone not found');
    }

    // Log zone retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_zone_by_id',
      description: `Retrieved zone: id=${id}, name=${zone.name}`,
    });

    return zone;
  }

  async updateZone(id: string, dto: UpdateZoneDto, userId: string, userName: string, userRole: string) {
    const existingZone = await this.prisma.zone.findUnique({ where: { id } });
    if (!existingZone) {
      throw new NotFoundException('Zone not found');
    }

    // Check if name is being changed and if it conflicts with another zone
    if (dto.name && dto.name !== existingZone.name) {
      const nameExists = await this.prisma.zone.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (nameExists) {
        throw new ConflictException('Zone with this name already exists');
      }
    }

    const updatedZone = await this.prisma.zone.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.city && { city: dto.city }),
        ...(dto.area && { area: dto.area }),
      },
      include: {
        projects: {
          include: {
            inventories: true,
          },
        },
      },
    });

    // Log zone update
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'update_zone',
      description: `Updated zone: id=${id}, name=${updatedZone.name}`,
    });

    return {
      status: 200,
      message: 'Zone updated successfully',
      data: updatedZone,
    };
  }

  async deleteZone(id: string, userId: string, userName: string, userRole: string) {
    const existingZone = await this.prisma.zone.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            inventories: true,
          },
        },
      },
    });
    
    if (!existingZone) {
      throw new NotFoundException('Zone not found');
    }

    // Check if zone has projects with inventories
    const hasInventories = existingZone.projects.some(project => project.inventories.length > 0);
    if (hasInventories) {
      throw new ConflictException('Cannot delete zone with existing projects that have inventories');
    }

    await this.prisma.zone.delete({ where: { id } });

    // Log zone deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_zone',
      description: `Deleted zone: id=${id}, name=${existingZone.name}`,
    });

    return {
      status: 200,
      message: 'Zone deleted successfully',
    };
  }

  async getZonesWithStats(userId: string, userName: string, userRole: string) {
    const zones = await this.prisma.zone.findMany({
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

    const zonesWithStats = zones.map(zone => {
      const totalProjects = zone.projects.length;
      const totalInventories = zone.projects.reduce((sum, project) => sum + project.inventories.length, 0);
      const totalLeads = zone.projects.reduce((sum, project) =>
        sum + project.inventories.reduce((sum, inv) => sum + inv.leads.length, 0), 0);
      const totalVisits = zone.projects.reduce((sum, project) =>
        sum + project.inventories.reduce((sum, inv) => sum + inv.visits.length, 0), 0);

      return {
        ...zone,
        stats: {
          totalProjects,
          totalInventories,
          totalLeads,
          totalVisits,
        },
      };
    });

    // Log zones stats retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_zones_with_stats',
      description: `Retrieved ${zonesWithStats.length} zones with statistics`,
    });

    return zonesWithStats;
  }

  async getZonesByCity(city: string, userId: string, userName: string, userRole: string) {
    const zones = await this.prisma.zone.findMany({
      where: { name: { contains: city.toLowerCase() } },
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

    // Log zones retrieval by city
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_zones_by_city',
      description: `Retrieved ${zones.length} zones for city: ${city}`,
    });

    return zones;
  }
} 