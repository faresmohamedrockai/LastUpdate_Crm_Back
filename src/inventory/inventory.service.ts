import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateInventoryDto } from './dtos/create.inventory.dto';
import { UpdateInventoryDto } from './dtos/update.inventory';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) {}

  async createInventory(dto: CreateInventoryDto, userId: string, userName: string, userRole: string) {
    // Validate project exists if provided
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        include: { developer: true, zone: true },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    // Validate payment plan exists if provided
    if (dto.paymentPlanId) {
      const paymentPlan = await this.prisma.paymentPlan.findUnique({
        where: { id: dto.paymentPlanId },
      });
      if (!paymentPlan) {
        throw new NotFoundException('Payment plan not found');
      }
    }

    // Check if inventory with same unit number in the same project already exists
    if (dto.unitNumber && dto.projectId) {
      const existingInventory = await this.prisma.inventory.findFirst({
        where: {
          unitNumber: dto.unitNumber,
          projectId: dto.projectId,
        },
      });
      if (existingInventory) {
        throw new ConflictException('Unit number already exists in this project');
      }
    }

    const inventory = await this.prisma.inventory.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        area: dto.area,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        unitNumber: dto.unitNumber,
        floor: dto.floor,
        images: dto.images ? JSON.stringify(dto.images) : null,
        status: dto.status,
        projectId: dto.projectId,
        paymentPlanId: dto.paymentPlanId,
      },
      include: {
        project: {
          include: {
            developer: true,
            zone: true,
          },
        },
        paymentPlan: true,
        leads: true,
        visits: true,
      },
    });

    // Log inventory creation
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'create_inventory',
      description: `Created inventory: title=${inventory.title}, price=${inventory.price}, project=${inventory.project?.name || 'none'}, developer=${inventory.project?.developer?.name || 'none'}`,
    });

    return {
      status: 201,
      message: 'Inventory created successfully',
      data: {
        ...inventory,
        images: inventory.images ? JSON.parse(inventory.images) : [],
      },
    };
  }

  async getAllInventories(userId: string, userName: string, userRole: string) {
    const inventories = await this.prisma.inventory.findMany({
      include: {
        project: {
          include: {
            developer: true,
            zone: true,
          },
        },
        paymentPlan: true,
        leads: true,
        visits: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log inventories retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_all_inventories',
      description: `Retrieved ${inventories.length} inventories`,
    });

    return inventories.map(inventory => ({
      ...inventory,
      images: inventory.images ? JSON.parse(inventory.images) : [],
    }));
  }

  async getInventoryById(id: string, userId: string, userName: string, userRole: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            developer: true,
            zone: true,
          },
        },
        paymentPlan: true,
        leads: {
          include: {
            owner: true,
          },
        },
        visits: {
          include: {
            lead: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    // Log inventory retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_inventory_by_id',
      description: `Retrieved inventory: id=${id}, title=${inventory.title}, price=${inventory.price}`,
    });

    return {
      status: 200,
      data: {
        ...inventory,
        images: inventory.images ? JSON.parse(inventory.images) : [],
      },
    };
  }

  async updateInventory(id: string, dto: UpdateInventoryDto, userId: string, userName: string, userRole: string) {
    const existingInventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!existingInventory) {
      throw new NotFoundException('Inventory not found');
    }

    // Validate project exists if provided
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    // Validate payment plan exists if provided
    if (dto.paymentPlanId) {
      const paymentPlan = await this.prisma.paymentPlan.findUnique({
        where: { id: dto.paymentPlanId },
      });
      if (!paymentPlan) {
        throw new NotFoundException('Payment plan not found');
      }
    }

    // Check if unit number conflicts with another inventory in the same project
    if (dto.unitNumber && (dto.projectId || existingInventory.projectId)) {
      const projectId = dto.projectId || existingInventory.projectId;
      const existingUnit = await this.prisma.inventory.findFirst({
        where: {
          unitNumber: dto.unitNumber,
          projectId,
          id: { not: id },
        },
      });
      if (existingUnit) {
        throw new ConflictException('Unit number already exists in this project');
      }
    }

    const updatedInventory = await this.prisma.inventory.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.price && { price: dto.price }),
        ...(dto.area && { area: dto.area }),
        ...(dto.bedrooms && { bedrooms: dto.bedrooms }),
        ...(dto.bathrooms && { bathrooms: dto.bathrooms }),
        ...(dto.unitNumber && { unitNumber: dto.unitNumber }),
        ...(dto.floor && { floor: dto.floor }),
        ...(dto.images && { images: JSON.stringify(dto.images) }),
        ...(dto.status && { status: dto.status }),
        ...(dto.projectId && { projectId: dto.projectId }),
        ...(dto.paymentPlanId && { paymentPlanId: dto.paymentPlanId }),
      },
      include: {
        project: {
          include: {
            developer: true,
            zone: true,
          },
        },
        paymentPlan: true,
        leads: true,
        visits: true,
      },
    });

    // Log inventory update
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'update_inventory',
      description: `Updated inventory: id=${id}, title=${updatedInventory.title}, price=${updatedInventory.price}`,
    });

    return {
      status: 200,
      message: 'Inventory updated successfully',
      data: {
        ...updatedInventory,
        images: updatedInventory.images ? JSON.parse(updatedInventory.images) : [],
      },
    };
  }

  async deleteInventory(id: string, userId: string, userName: string, userRole: string) {
    const existingInventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: { leads: true, visits: true },
    });
    
    if (!existingInventory) {
      throw new NotFoundException('Inventory not found');
    }

    // Check if inventory has leads or visits
    if (existingInventory.leads.length > 0 || existingInventory.visits.length > 0) {
      throw new ConflictException('Cannot delete inventory with existing leads or visits');
    }

    await this.prisma.inventory.delete({ where: { id } });

    // Log inventory deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_inventory',
      description: `Deleted inventory: id=${id}, title=${existingInventory.title}`,
    });

    return {
      status: 200,
      message: 'Inventory deleted successfully',
    };
  }

  async getInventoriesByProject(projectId: string, userId: string, userName: string, userRole: string) {
    const inventories = await this.prisma.inventory.findMany({
      where: { projectId },
      include: {
        project: {
          include: {
            developer: true,
            zone: true,
          },
        },
        paymentPlan: true,
        leads: true,
        visits: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log inventories retrieval by project
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_inventories_by_project',
      description: `Retrieved ${inventories.length} inventories for project: ${projectId}`,
    });

    return inventories.map(inventory => ({
      ...inventory,
      images: inventory.images ? JSON.parse(inventory.images) : [],
    }));
  }

  async getInventoriesByDeveloper(developerId: string, userId: string, userName: string, userRole: string) {
    const inventories = await this.prisma.inventory.findMany({
      where: {
        project: {
          developerId,
        },
      },
      include: {
        project: {
          include: {
            developer: true,
            zone: true,
          },
        },
        paymentPlan: true,
        leads: true,
        visits: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log inventories retrieval by developer
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_inventories_by_developer',
      description: `Retrieved ${inventories.length} inventories for developer: ${developerId}`,
    });

    return inventories.map(inventory => ({
      ...inventory,
      images: inventory.images ? JSON.parse(inventory.images) : [],
    }));
  }

  async getInventoriesByZone(zoneId: string, userId: string, userName: string, userRole: string) {
    const inventories = await this.prisma.inventory.findMany({
      where: {
        project: {
          zoneId,
        },
      },
      include: {
        project: {
          include: {
            developer: true,
            zone: true,
          },
        },
        paymentPlan: true,
        leads: true,
        visits: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log inventories retrieval by zone
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_inventories_by_zone',
      description: `Retrieved ${inventories.length} inventories for zone: ${zoneId}`,
    });

    return inventories.map(inventory => ({
      ...inventory,
      images: inventory.images ? JSON.parse(inventory.images) : [],
    }));
  }

  async getInventoriesByStatus(status: string, userId: string, userName: string, userRole: string) {
    const inventories = await this.prisma.inventory.findMany({
      where: { status: status as any },
      include: {
        project: {
          include: {
            developer: true,
            zone: true,
          },
        },
        paymentPlan: true,
        leads: true,
        visits: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log inventories retrieval by status
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_inventories_by_status',
      description: `Retrieved ${inventories.length} inventories with status: ${status}`,
    });

    return inventories.map(inventory => ({
      ...inventory,
      images: inventory.images ? JSON.parse(inventory.images) : [],
    }));
  }



  
}
