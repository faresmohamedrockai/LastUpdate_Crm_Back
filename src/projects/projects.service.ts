import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import {UpdateProjectDto} from './dto/update-project.dto'
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryservice: CloudinaryService,
    private readonly logsService: LogsService,
  ) { }

  // Helper method to validate and parse dates
  private validateAndParseDate(dateString: string | null | undefined, fieldName: string): Date | null {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName}: ${dateString}. Must be a valid date.`);
    }
    
    return date;
  }

  // Helper method to provide default dates if needed
  private getDefaultDates() {
    const now = new Date();
    const firstInstallmentDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // Next month, 1st day
    const deliveryDate = new Date(now.getFullYear() + 2, now.getMonth(), 1); // 2 years later
    
    return {
      firstInstallmentDate,
      deliveryDate
    };
  }

async createProject(
  dto: CreateProjectDto,
  email: string,
  userRole: string,
) {
  // 1. تحقق من developer
  if (dto.developerId) {
    const developer = await this.prisma.developer.findUnique({
      where: { id: dto.developerId },
    });
    if (!developer) {
      throw new NotFoundException('Developer not found');
    }
  }

  // 2. تحقق من zone
  if (dto.zoneId) {
    const zone = await this.prisma.zone.findUnique({
      where: { id: dto.zoneId },
    });
    if (!zone) {
      throw new NotFoundException('Zone not found');
    }
  }

  // 3. تأكد من عدم تكرار الاسم
  const existingProject = await this.prisma.project.findFirst({
    where: { nameEn: dto.nameEn },
  });
  if (existingProject) {
    throw new ConflictException('Project with this name already exists');
  }

  // 4. رفع الصور من base64 إلى Cloudinary (لو موجودة)
  let uploadedImages: string[] = [];

  if (dto.images && dto.images.length > 0) {
    uploadedImages = await Promise.all(
      dto.images.map((base64, index) =>
        this.cloudinaryservice.uploadImageFromBase64(base64, 'projects', `project_${Date.now()}_${index}`)
      ),
    );
  }

  const project = await this.prisma.project.create({
    data: {
      nameEn: dto.nameEn,
      nameAr: dto.nameAr ?? null,
      description: dto.description ?? null,
      images:  uploadedImages ?? [],
      developerId: dto.developerId ?? null,
      zoneId: dto.zoneId ?? null,
      type: dto.type ?? 'residential',
      inventories: dto.inventories?.length
        ? { connect: dto.inventories.map((id) => ({ id })) }
        : undefined,
    },
    include: {
      developer: true,
      zone: true,
      inventories: true,
      paymentPlans: true,
    },
  });

  // 5. إضافة خطط الدفع مع التحقق من صحة التواريخ
  if (dto.paymentPlans && dto.paymentPlans.length > 0) {
    const defaultDates = this.getDefaultDates();
    
    for (const plan of dto.paymentPlans) {
      // Validate and parse dates, use defaults if invalid/missing
      let firstInstallmentDate: Date | null = null;
      let deliveryDate: Date | null = null;

      try {
        firstInstallmentDate = this.validateAndParseDate(plan.firstInstallmentDate, 'firstInstallmentDate') 
          || defaultDates.firstInstallmentDate;
        
        deliveryDate = this.validateAndParseDate(plan.deliveryDate, 'deliveryDate') 
          || defaultDates.deliveryDate;

        // Ensure delivery date is after first installment date
        if (deliveryDate && firstInstallmentDate && deliveryDate <= firstInstallmentDate) {
          deliveryDate = new Date(firstInstallmentDate.getTime() + (2 * 365 * 24 * 60 * 60 * 1000)); // Add 2 years
        }

      } catch (error) {
        // If validation fails, use default dates
        console.warn(`Using default dates for payment plan due to validation error: ${error.message}`);
        firstInstallmentDate = defaultDates.firstInstallmentDate;
        deliveryDate = defaultDates.deliveryDate;
      }

      await this.prisma.paymentPlan.create({
        data: {
          downpayment: plan.downpayment,
          installment: 100 - plan.downpayment - plan.delivery,
          delivery: plan.delivery,
          schedule: plan.schedule,
          description: plan.description,
          yearsToPay: plan.yearsToPay,
          installmentPeriod: plan.installmentPeriod,
          installmentMonthsCount: plan.installmentMonthsCount,
          firstInstallmentDate,
          deliveryDate,
          projectId: project.id,
        },
      });
    }
  }

  return {
    status: 201,
    message: 'Project created successfully',
    data: {
      ...project,
      images: project.images ?? [],
    },
  };
}

  async getAllProjects() {
    const data = await this.prisma.project.findMany({
      include: {
        developer: false,
        zone: false,
        inventories: {
          include: {
            leads: false,
            visits: false,
          },
        },
        paymentPlans: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: 200,
      message: 'Projects retrieved successfully',
      data: data.map(project => ({
        ...project,
        createdAt: project.createdAt?.toISOString(),
        images: project.images ?? [],
        paymentPlans: project.paymentPlans.map(plan => ({
          ...plan,
          createdAt: plan.createdAt?.toISOString(),
          // Ensure dates are properly formatted and valid
          firstInstallmentDate: plan.firstInstallmentDate 
            ? plan.firstInstallmentDate.toISOString().split('T')[0] 
            : null,
          deliveryDate: plan.deliveryDate 
            ? plan.deliveryDate.toISOString().split('T')[0] 
            : null,
        })),
        inventories: project.inventories.map(inv => ({
          ...inv,
          createdAt: inv.createdAt?.toISOString(),
          images: inv.images ?? [],
        })),
      })),
    };
  }

 async updateProject(
  id: string,
  dto: UpdateProjectDto,
  userId: string,
  email: string,
  userRole: string,
) {
  // 1. تحقق من وجود المشروع
  const existingProject = await this.prisma.project.findUnique({
    where: { id },
    include: { paymentPlans: true },
  });
  if (!existingProject) throw new NotFoundException('Project not found');

  // 2. تحقق من وجود المطور
  if (dto.developerId) {
    const developer = await this.prisma.developer.findUnique({
      where: { id: dto.developerId },
    });
    if (!developer) throw new NotFoundException('Developer not found');
  }

  // 3. تحقق من وجود المنطقة
  if (dto.zoneId) {
    const zone = await this.prisma.zone.findUnique({
      where: { id: dto.zoneId },
    });
    if (!zone) throw new NotFoundException('Zone not found');
  }

  // 4. تحقق من عدم تكرار الاسم الإنجليزي
  if (dto.nameEn && dto.nameEn !== existingProject.nameEn) {
    const duplicate = await this.prisma.project.findFirst({
      where: {
        nameEn: dto.nameEn,
        id: { not: id },
      },
    });
    if (duplicate) throw new ConflictException('Project with this English name already exists');
  }

  // 5. جهز بيانات التحديث
  const dataToUpdate: any = {};
  if (dto.nameEn !== undefined) dataToUpdate.nameEn = dto.nameEn;
  if (dto.nameAr !== undefined) dataToUpdate.nameAr = dto.nameAr;
  if (dto.description !== undefined) dataToUpdate.description = dto.description;
  if (dto.images !== undefined) dataToUpdate.images = dto.images;
  if (dto.developerId !== undefined) dataToUpdate.developerId = dto.developerId;
  if (dto.zoneId !== undefined) dataToUpdate.zoneId = dto.zoneId;

  // 6. تحديث المشروع
  const updatedProject = await this.prisma.project.update({
    where: { id },
    data: dataToUpdate,
    include: {
      developer: true,
      zone: true,
      inventories: true,
      paymentPlans: true,
    },
  });

  // 7. حذف خطط الدفع القديمة
  await this.prisma.paymentPlan.deleteMany({
    where: { projectId: id },
  });

  // 8. إضافة الخطط الجديدة مع التحقق من صحة التواريخ
  if (dto.paymentPlans && dto.paymentPlans.length > 0) {
    const defaultDates = this.getDefaultDates();
    
    for (const plan of dto.paymentPlans) {
      // Validate and parse dates, use defaults if invalid/missing
      let firstInstallmentDate: Date | null = null;
      let deliveryDate: Date | null = null;

      try {
        firstInstallmentDate = this.validateAndParseDate(plan.firstInstallmentDate, 'firstInstallmentDate') 
          || defaultDates.firstInstallmentDate;
        
        deliveryDate = this.validateAndParseDate(plan.deliveryDate, 'deliveryDate') 
          || defaultDates.deliveryDate;

        // Ensure delivery date is after first installment date
        if (deliveryDate && firstInstallmentDate && deliveryDate <= firstInstallmentDate) {
          deliveryDate = new Date(firstInstallmentDate.getTime() + (2 * 365 * 24 * 60 * 60 * 1000)); // Add 2 years
        }

      } catch (error) {
        // If validation fails, use default dates
        console.warn(`Using default dates for payment plan due to validation error: ${error.message}`);
        firstInstallmentDate = defaultDates.firstInstallmentDate;
        deliveryDate = defaultDates.deliveryDate;
      }

      await this.prisma.paymentPlan.create({
        data: {
          downpayment: plan.downpayment,
          installment: 100 - plan.downpayment - plan.delivery,
          delivery: plan.delivery,
          schedule: plan.schedule,
          description: plan.description,
          yearsToPay: plan.yearsToPay,
          installmentPeriod: plan.installmentPeriod,
          installmentMonthsCount: plan.installmentMonthsCount,
          firstInstallmentDate,
          deliveryDate,
          projectId: id,
        },
      });
    }
  }

  // 9. إعادة المشروع المحدّث
  return {
    status: 200,
    message: 'Project updated successfully',
    data: {
      ...updatedProject,
      images: updatedProject.images ?? [],
    },
  };
}

 async deleteProject(id: string, userId: string, userName: string, userRole: string) {
  const exists = await this.prisma.project.findUnique({
    where: { id },
    include: {
      inventories: true,
      paymentPlans: true,
    },
  });

  if (!exists) throw new NotFoundException('Project not found');

  // حذف جميع خطط الدفع المرتبطة بالمشروع
  await this.prisma.paymentPlan.deleteMany({
    where: { projectId: id },
  });

  // حذف المشروع
  await this.prisma.project.delete({
    where: { id },
  });

  return {
    status: 200,
    message: 'Project deleted successfully',
  };
}
}
