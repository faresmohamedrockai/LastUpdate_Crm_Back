import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInventoryDto } from './dtos/create.inventory.dto';
import { UpdateInventoryDto } from './dtos/update.inventory';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // إنشاء وحدة عقارية
  async createInventory(dto: CreateInventoryDto) {
    const uploadedImages = await Promise.all(
      (dto.base64Images ?? []).map((img) =>
        this.cloudinaryService.uploadImageFromBase64(img),
      ),
    );

    const { projectId, base64Images, ...rest } = dto;

    const inventory = await this.prisma.inventory.create({
      data: {
        ...rest,
        images: JSON.stringify(uploadedImages),
        ...(projectId && { project: { connect: { id: projectId } } }),
      },
    });

    return {
      status: 201,
      message: 'Inventory created successfully',
      data: inventory,
    };
  }

  // عرض كل الوحدات العقارية
  async listInventory() {
    const data = await this.prisma.inventory.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: true,
      },
    });

    return data.map((inv) => ({
  ...inv,
  images: inv.images ? JSON.parse(inv.images) : [],
}));

  }

  // تعديل وحدة عقارية
  async updateInventory(id: string, dto: UpdateInventoryDto) {
    const exists = await this.prisma.inventory.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Inventory not found');

    let updatedImages = exists.images ? JSON.parse(exists.images) : [];

    if (dto.base64Images && dto.base64Images.length > 0) {
      const newImages = await Promise.all(
        dto.base64Images.map((img) =>
          this.cloudinaryService.uploadImageFromBase64(img),
        ),
      );
      updatedImages = [...updatedImages, ...newImages];
    }

    const { base64Images, ...rest } = dto;

    const updated = await this.prisma.inventory.update({
      where: { id },
      data: {
        ...rest,
        images: JSON.stringify(updatedImages),
      },
    });

    return {
      status: 200,
      message: 'Inventory updated successfully',
      data: updated,
    };
  }

  // حذف وحدة عقارية
  async deleteInventory(id: string) {
    const exists = await this.prisma.inventory.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Inventory not found');

    await this.prisma.inventory.delete({ where: { id } });

    return {
      status: 200,
      message: 'Inventory deleted successfully',
    };
  }

  // فلترة الوحدات
  async filterInventory(query: any) {
    const {
      type,
      location,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      projectId,
    } = query;

    const where: any = {};

    if (type) where.type = type;
    if (location)
      where.location = { contains: location, mode: 'insensitive' };
    if (bedrooms) where.bedrooms = +bedrooms;
    if (bathrooms) where.bathrooms = +bathrooms;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = +minPrice;
      if (maxPrice) where.price.lte = +maxPrice;
    }
    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = +minArea;
      if (maxArea) where.area.lte = +maxArea;
    }
    if (projectId) where.projectId = projectId;

    const data = await this.prisma.inventory.findMany({
      where,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

  return data.map((inv) => ({
  ...inv,
  images: inv.images ? JSON.parse(inv.images) : [],
}));

  }
}
