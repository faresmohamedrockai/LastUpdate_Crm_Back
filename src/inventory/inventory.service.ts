// ✅ InventoryService.ts - بعد التعديل الكامل

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  // ممكن تتحقق من developerId و zoneId إذا هي مطلوبة (حسب النموذج)
// 4. رفع الصور من base64 إلى Cloudinary (لو موجودة)
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
      images:uploadedImages,
      location: dto.location,
      area: dto.area,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
     
      amenities: dto.amenities ?? [],
      typeOther: dto.typeOther,
      amenitiesOther: dto.amenitiesOther,
      
      status: dto.status,
      zoneId: dto.zoneId!,          // إذا هي حقل مطلوب في الموديل
      projectId: dto.projectId!,
      developerId: dto.developerId!,
      paymentPlanId: dto.paymentPlanId,
    },
    include: {
      project: { include: { developer: true, zone: true } },
      paymentPlan: true,
      leads: true,
   
    },
  });








    // Log developer deletion
    await this.logsService.createLog({
      userId,
      email,
      userRole:role,
      action: 'Create Inventory',
      description: `Inventory developer: id=${inventory.id}, name=${inventory.titleEn}`,
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

      },
      orderBy: { createdAt: 'desc' },
    });

     return {
  properties: inventories.map((inventory) => ({
    ...inventory,
    images: inventory.images ?? [],
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

  // تحقق من projectId
  if (dto.projectId) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { developer: true, zone: true },
    });
    if (!project) throw new NotFoundException('Project not found');
  }

  // تحقق من paymentPlanId
  if (dto.paymentPlanId) {
    const paymentPlan = await this.prisma.paymentPlan.findUnique({
      where: { id: dto.paymentPlanId },
    });
    if (!paymentPlan) throw new NotFoundException('Payment plan not found');
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
      images: uploadedImages,
      status: dto.status,
      zoneId: dto.zoneId,
      projectId: dto.projectId,
      developerId: dto.developerId,
      paymentPlanId: dto.paymentPlanId,
      
     
    },
    include: {
      project: { include: { developer: true, zone: true } },
      paymentPlan: true,
      leads: true,
  
    },
  });



  // Log  
    await this.logsService.createLog({
      userId,
      email,
      userRole:role,
      action: 'delete_developer',
      description: `Deleted developer: id=${updatedInventory.id}, name=${updatedInventory.titleEn}`,
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





  async deleteInventory(id: string, userId: string, email: string, role: string) {
    const existingInventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: { leads: true },
    });

    if (!existingInventory) throw new NotFoundException('Inventory not found');

    if (existingInventory.leads.length >0 ) {
      throw new ConflictException('Cannot delete inventory with existing leads or visits');
    }


  await this.logsService.createLog({
      userId,
      email,
      userRole:role,
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
