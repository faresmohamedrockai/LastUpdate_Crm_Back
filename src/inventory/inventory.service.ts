import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInventoryDto } from './dtos/create.inventory.dto';
import { UpdateInventoryDto } from './dtos/update.inventory';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import type { Express } from 'express';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createInventory(dto: CreateInventoryDto, files: Express.Multer.File[]) {
    const uploadedImages = await Promise.all(
      files.map((file) => this.cloudinaryService.uploadImage(file)),
    );
const { projectId, ...rest } = dto;

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

  
 async listInventory() {
  const data = await this.prisma.inventory.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      project: true, // ← دي بتجيب بيانات المشروع المرتبط بالعقار
    },
  });

  return data.map((inv) => ({
    ...inv,
    images: JSON.parse(inv.images),
  }));
}


  
  async updateInventory(
    id: string,
    dto: UpdateInventoryDto,
    files?: Express.Multer.File[],
  ) {
    const exists = await this.prisma.inventory.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Inventory not found');

    let updatedImages = exists.images ? JSON.parse(exists.images) : [];

    if (files && files.length > 0) {
      const newImages = await Promise.all(
        files.map((file) => this.cloudinaryService.uploadImage(file)),
      );
      updatedImages = [...updatedImages, ...newImages];
    }

    const updated = await this.prisma.inventory.update({
      where: { id },
      data: {
        ...dto,
        images: JSON.stringify(updatedImages),
        

      },
    });

    return {
      status: 200,
      message: 'Inventory updated successfully',
      data: updated,
    };
  }

 
  async deleteInventory(id: string) {
    const exists = await this.prisma.inventory.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Inventory not found');

    await this.prisma.inventory.delete({ where: { id } });

    return {
      status: 200,
      message: 'Inventory deleted successfully',
    };
  }




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
  if (location) where.location = { contains: location, mode: 'insensitive' };
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
    images: JSON.parse(inv.images),
  }));
}

}
