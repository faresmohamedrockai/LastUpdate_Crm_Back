import { Injectable, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

@Injectable()
export class ZonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) { }

  
async createZone(dto: CreateZoneDto, userId: string, userName: string, userRole: string) {
  try {
    const zoneExists = await this.prisma.zone.findFirst({
      where: {
        nameEn: dto.nameEn,
      },
    });

    if (zoneExists) {
      throw new ConflictException('Zone already exists');
    }

    const zone = await this.prisma.zone.create({
      data: {
        nameEn: dto.nameEn,
        nameAr: dto.nameAr || '',
        description: dto.description || '',
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    await this.logsService.createLog({
      action: 'CREATE',
      userId,
      userName,
      userRole,
      description: `Created zone: nameEn=${zone.nameEn}, lat=${zone.latitude}, lng=${zone.longitude}`,
    });

    return zone;
  } catch (error) {
    throw new HttpException('Failed to create zone', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

async getAllZones(userId: string, email: string, userRole: string) {
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

  
  const formattedZones = zones.map(zone => ({
    ...zone,
    projects: zone.projects.map(project => ({
      ...project,
      createdAt: project.createdAt.toLocaleDateString(), 
      inventories: project.inventories.map(inv => ({
        ...inv,
        createdAt: inv.createdAt.toLocaleDateString(), 
      })),
    })),
  }));

  // // Log zones retrieval
  // await this.logsService.createLog({
  //   userId,
  //   email,
  //   userRole,
  //   action: 'get_all_zones',
  //   description: `Retrieved ${zones.length} zones`,
  // });

  return {
    zones: formattedZones,
  };
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
      description: `Retrieved zone: id=${id}, name=${zone.nameEn}`,
    });

    return zone;
  }







  async updateZone(id: string, dto: UpdateZoneDto, userId: string, email: string, userRole: string) {
    const existingZone = await this.prisma.zone.findUnique({ where: { id } });
    if (!existingZone) {
      throw new NotFoundException('Zone not found');
    }

    // Check if name is being changed and if it conflicts with another zone
    if (dto.nameEn && dto.nameEn !== existingZone.nameEn) {
      const nameExists = await this.prisma.zone.findFirst({
        where: { nameEn: dto.nameEn, id: { not: id } },
      });
      if (nameExists) {
        throw new ConflictException('Zone with this English name already exists');
      }
    }

    const updatedZone = await this.prisma.zone.update({
      where: { id },
      data: {
        ...(dto.nameEn && { nameEn: dto.nameEn }),
        ...(dto.nameAr && { nameAr: dto.nameAr }),
        ...(dto.description && { description: dto.description }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        
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
      email,
      userRole,
      action: 'update_zone',
      description: `Updated zone: id=${id}, nameEn=${updatedZone.nameEn}`,
    });

    return {
      status: 200,
      message: 'Zone updated successfully',
      data: updatedZone,
    };
  }


  async deleteZone(id: string, userId: string, email: string, userRole: string) {
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
      email,
      userRole,
      action: 'delete_zone',
      description: `Deleted zone: id=${id}, name=${existingZone.nameEn} with user:${email}`,
    });

    return {
      status: 200,
      message: 'Zone deleted successfully',
    };
  }


} 