// ✅ InventoryService.ts - بعد التعديل الكامل

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateInventoryDto } from './dtos/create.inventory.dto';
import { UpdateInventoryDto } from './dtos/update.inventory';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
    private readonly CloudinaryService: CloudinaryService,
  ) {}

  async createInventory(dto: CreateInventoryDto, userId: string, email: string, role: string) {
    // Validate project and payment plan index if provided
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        include: { 
          developer: true, 
          zone: true,
          paymentPlans: true 
        },
      });
      if (!project) throw new NotFoundException('Project not found');

      // Validate paymentPlanIndex if provided
      if (dto.paymentPlanIndex !== undefined) {
        if (dto.paymentPlanIndex < 0 || dto.paymentPlanIndex >= project.paymentPlans.length) {
          throw new BadRequestException(`Payment plan index ${dto.paymentPlanIndex} is out of range. Project has ${project.paymentPlans.length} payment plans.`);
        }
      }
    }

    // رفع الصور من base64 إلى Cloudinary (لو موجودة)
    let uploadedImages: string[] = [];

    if (dto.images && dto.images.length > 0) {
      uploadedImages = await Promise.all(
        dto.images.map((base64, index) =>
          this.CloudinaryService.uploadImageFromBase64(base64, 'projects', `project_${Date.now()}_${index}`)
        ),
      );
    }

    const inventory = await this.prisma.inventory.create({
      data: {
        title: dto.title,
        titleEn: dto.titleEn,
        titleAr: dto.titleAr,
        type: dto.type,
        price: dto.price,
        images: uploadedImages,
        location: dto.location,
        area: dto.area,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        amenities: dto.amenities ?? [],
        typeOther: dto.typeOther,
        amenitiesOther: dto.amenitiesOther,
        status: dto.status,
        zoneId: dto.zoneId!,
        projectId: dto.projectId!,
        developerId: dto.developerId!,
        paymentPlanIndex: dto.paymentPlanIndex, // Store index directly
        parking: dto.parking,
      },
      include: {
        project: { 
          include: { 
            developer: true, 
            zone: true,
            paymentPlans: true // Include to access payment plan details by index
          } 
        },
        leads: true,
      },
    });

    // Log inventory creation
    await this.logsService.createLog({
      userId,
      email,
      userRole: role,
      action: 'Create Inventory',
      description: `Inventory created: id=${inventory.id}, name=${inventory.titleEn}`,
    });

    // Build response with payment plan details if index is set
    const responseData = {
      ...inventory,
      images: inventory.images ?? [],
      paymentPlan: inventory.paymentPlanIndex !== null && inventory.project?.paymentPlans && inventory.project.paymentPlans[inventory.paymentPlanIndex]
        ? {
            ...inventory.project.paymentPlans[inventory.paymentPlanIndex],
            firstInstallmentDate: inventory.project.paymentPlans[inventory.paymentPlanIndex].firstInstallmentDate
              ? inventory.project.paymentPlans[inventory.paymentPlanIndex].firstInstallmentDate!.toISOString().split('T')[0]
              : null,
            deliveryDate: inventory.project.paymentPlans[inventory.paymentPlanIndex].deliveryDate
              ? inventory.project.paymentPlans[inventory.paymentPlanIndex].deliveryDate!.toISOString().split('T')[0]
              : null,
          }
        : null,
    };

    return {
      status: 201,
      message: 'Inventory created successfully',
      data: responseData,
    };
  }

  async getAllInventories(userId: string, userName: string, userRole: string) {
    const inventories = await this.prisma.inventory.findMany({
      include: {
        project: { 
          include: { 
            developer: true, 
            zone: true,
            paymentPlans: true // Include to access payment plan details by index
          } 
        },
        leads: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      properties: inventories.map((inventory) => ({
        ...inventory,
        images: inventory.images ?? [],
        paymentPlan: inventory.paymentPlanIndex !== null && inventory.project?.paymentPlans && inventory.project.paymentPlans[inventory.paymentPlanIndex]
          ? {
              ...inventory.project.paymentPlans[inventory.paymentPlanIndex],
              firstInstallmentDate: inventory.project.paymentPlans[inventory.paymentPlanIndex].firstInstallmentDate
                ? inventory.project.paymentPlans[inventory.paymentPlanIndex].firstInstallmentDate!.toISOString().split('T')[0]
                : null,
              deliveryDate: inventory.project.paymentPlans[inventory.paymentPlanIndex].deliveryDate
                ? inventory.project.paymentPlans[inventory.paymentPlanIndex].deliveryDate!.toISOString().split('T')[0]
                : null,
            }
          : null,
      })),
    };
  }

  async updateInventory(
    id: string,
    dto: UpdateInventoryDto,
    userId: string,
    email: string,
    role: string,
  ) {
    const existingInventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!existingInventory) throw new NotFoundException('Inventory not found');

    // Validate project and payment plan index
    if (dto.projectId || dto.paymentPlanIndex !== undefined) {
      const projectId = dto.projectId || existingInventory.projectId;
      if (projectId) {
        const project = await this.prisma.project.findUnique({
          where: { id: projectId },
          include: { 
            developer: true, 
            zone: true,
            paymentPlans: true 
          },
        });
        if (!project) throw new NotFoundException('Project not found');

        // Validate paymentPlanIndex if provided
        if (dto.paymentPlanIndex !== undefined) {
          if (dto.paymentPlanIndex < 0 || dto.paymentPlanIndex >= project.paymentPlans.length) {
            throw new BadRequestException(`Payment plan index ${dto.paymentPlanIndex} is out of range. Project has ${project.paymentPlans.length} payment plans.`);
          }
        }
      }
    }

    let uploadedImages: string[] = [];

    if (dto.images && dto.images.length > 0) {
      uploadedImages = await Promise.all(
        dto.images.map((base64, index) =>
          this.CloudinaryService.uploadImageFromBase64(base64, 'projects', `project_${Date.now()}_${index}`)
        ),
      );
    }

    // التحديث
    const updatedInventory = await this.prisma.inventory.update({
      where: { id },
      data: {
        title: dto.title,
        titleEn: dto.titleEn,
        titleAr: dto.titleAr,
        type: dto.type,
        price: dto.price,
        location: dto.location,
        area: dto.area,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        amenities: dto.amenities,
        typeOther: dto.typeOther,
        amenitiesOther: dto.amenitiesOther,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        status: dto.status,
        zoneId: dto.zoneId,
        projectId: dto.projectId,
        developerId: dto.developerId,
        paymentPlanIndex: dto.paymentPlanIndex, // Store index directly
        parking: dto.parking,
      },
      include: {
        project: { 
          include: { 
            developer: true, 
            zone: true,
            paymentPlans: true // Include to access payment plan details by index
          } 
        },
        leads: true,
      },
    });

    // Log inventory update
    await this.logsService.createLog({
      userId,
      email,
      userRole: role,
      action: 'Update Inventory',
      description: `Updated inventory: id=${updatedInventory.id}, name=${updatedInventory.titleEn}`,
    });

    // Build response with payment plan details if index is set
    const responseData = {
      ...updatedInventory,
      images: updatedInventory.images ?? [],
      paymentPlan: updatedInventory.paymentPlanIndex !== null && updatedInventory.project?.paymentPlans && updatedInventory.project.paymentPlans[updatedInventory.paymentPlanIndex]
        ? {
            ...updatedInventory.project.paymentPlans[updatedInventory.paymentPlanIndex],
            firstInstallmentDate: updatedInventory.project.paymentPlans[updatedInventory.paymentPlanIndex].firstInstallmentDate
              ? updatedInventory.project.paymentPlans[updatedInventory.paymentPlanIndex].firstInstallmentDate!.toISOString().split('T')[0]
              : null,
            deliveryDate: updatedInventory.project.paymentPlans[updatedInventory.paymentPlanIndex].deliveryDate
              ? updatedInventory.project.paymentPlans[updatedInventory.paymentPlanIndex].deliveryDate!.toISOString().split('T')[0]
              : null,
          }
        : null,
    };

    return {
      status: 200,
      message: 'Inventory updated successfully',
      data: responseData,
    };
  }

  async deleteInventory(id: string, userId: string, email: string, role: string) {
    const existingInventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: { leads: true },
    });

    if (!existingInventory) throw new NotFoundException('Inventory not found');

    if (existingInventory.leads.length > 0) {
      throw new ConflictException('Cannot delete inventory with existing leads or visits');
    }

    await this.logsService.createLog({
      userId,
      email,
      userRole: role,
      action: 'delete_inventory',
      description: `Deleted inventory: id=${id}, title=${existingInventory.title}`,
    });

    await this.prisma.inventory.delete({ where: { id } });

    return {
      status: 200,
      message: 'Inventory deleted successfully',
    };
  }
}
