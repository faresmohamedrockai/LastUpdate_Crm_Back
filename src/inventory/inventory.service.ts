// ✅ InventoryService.ts - بعد التعديل الكامل

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
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        include: { developer: true, zone: true },
      });
      if (!project) throw new NotFoundException('Project not found');
    }

    if (dto.paymentPlanId) {
      const paymentPlan = await this.prisma.paymentPlan.findUnique({
        where: { id: dto.paymentPlanId },
      });
      if (!paymentPlan) throw new NotFoundException('Payment plan not found');
    }

    if (dto.unitNumber && dto.projectId) {
      const existingInventory = await this.prisma.inventory.findFirst({
        where: {
          unitNumber: dto.unitNumber,
          projectId: dto.projectId,
        },
      });
      if (existingInventory) throw new ConflictException('Unit number already exists in this project');
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
        images: dto.images ?? [], // ✅ لا تحتاج stringify
        status: dto.status,
        projectId: dto.projectId,
        paymentPlanId: dto.paymentPlanId,
      },
      include: {
        project: { include: { developer: true, zone: true } },
        paymentPlan: true,
        leads: true,
        visits: true,
      },
    });

    return {
      status: 201,
      message: 'Inventory created successfully',
      data: {
        ...inventory,
        images: inventory.images ?? [],
      },
    };
  }

  async getAllInventories(userId: string, userName: string, userRole: string) {
    const inventories = await this.prisma.inventory.findMany({
      include: {
        project: { include: { developer: true, zone: true } },
        paymentPlan: true,
        leads: true,
        visits: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return inventories.map((inventory) => ({
      ...inventory,
      images: inventory.images ?? [],
    }));
  }

  async updateInventory(id: string, dto: UpdateInventoryDto, userId: string, userName: string, userRole: string) {
    const existingInventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!existingInventory) throw new NotFoundException('Inventory not found');

    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
      if (!project) throw new NotFoundException('Project not found');
    }

    if (dto.paymentPlanId) {
      const paymentPlan = await this.prisma.paymentPlan.findUnique({ where: { id: dto.paymentPlanId } });
      if (!paymentPlan) throw new NotFoundException('Payment plan not found');
    }

    if (dto.unitNumber && (dto.projectId || existingInventory.projectId)) {
      const projectId = dto.projectId || existingInventory.projectId;
      const existingUnit = await this.prisma.inventory.findFirst({
        where: {
          unitNumber: dto.unitNumber,
          projectId,
          id: { not: id },
        },
      });
      if (existingUnit) throw new ConflictException('Unit number already exists in this project');
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
        ...(dto.images && { images: dto.images }), // ✅ لا تستخدم JSON.stringify
        ...(dto.status && { status: dto.status }),
        ...(dto.projectId && { projectId: dto.projectId }),
        ...(dto.paymentPlanId && { paymentPlanId: dto.paymentPlanId }),
      },
      include: {
        project: { include: { developer: true, zone: true } },
        paymentPlan: true,
        leads: true,
        visits: true,
      },
    });

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
        images: updatedInventory.images ?? [],
      },
    };
  }

  async deleteInventory(id: string, userId: string, userName: string, userRole: string) {
    const existingInventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: { leads: true, visits: true },
    });

    if (!existingInventory) throw new NotFoundException('Inventory not found');

    if (existingInventory.leads.length > 0 || existingInventory.visits.length > 0) {
      throw new ConflictException('Cannot delete inventory with existing leads or visits');
    }

    await this.prisma.inventory.delete({ where: { id } });

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
}
