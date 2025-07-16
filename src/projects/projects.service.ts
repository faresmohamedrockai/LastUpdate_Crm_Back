import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private readonly logsService: LogsService,
  ) { }

async createProject(
  dto: CreateProjectDto,
  userId: string,
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

  // 4. إنشاء المشروع
  const project = await this.prisma.project.create({
    data: {
      nameEn: dto.nameEn,
      nameAr: dto.nameAr ?? null,
      location: dto.location,
      description: dto.description ?? null,
      images: dto.images ?? [],
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

  // 5. إضافة payment plans (لو موجودة)
  if (dto.paymentPlans && dto.paymentPlans.length > 0) {
    for (const plan of dto.paymentPlans) {
      await this.prisma.paymentPlan.create({
        data: {
          downpayment: plan.downPayment,
          installment: plan.installment,
          delivery: plan.delivery,
          schedule: plan.schedule,
          description: plan.description,
          yearsToPay: plan.yearsToPay,
          installmentPeriod: plan.installmentPeriod,
          installmentEvery: plan.installmentEvery,
          projectId: project.id,
        },
      });
    }
  }

  // 6. لوج العملية
  await this.logsService.createLog({
    userId,
    email,
    userRole,
    action: 'create_project',
    description: `Created project: name=${project.nameEn}, location=${project.location}`,
  });

  return {
    status: 201,
    message: 'Project created successfully',
    data: {
      ...project,
      images: project.images ?? [],
    },
  };
}



//  async getAllProjects(userId: string, userName: string, userRole: string) {
  async getAllProjects(userId: string, email: string, userRole: string) {
  const data = await this.prisma.project.findMany({
    include: {
      developer: true,
      zone: true,
      inventories: {
        include: {
          leads: true,
          visits: true,
        },
      },
      paymentPlans: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  await this.logsService.createLog({
    userId,
    email,
    userRole,
    action: 'get_all_projects',
    description: `Retrieved ${data.length} projects`,
  });

  return {
    status: 200,
    message: 'Projects retrieved successfully',
    data: data.map(project => ({
      ...project,
      images: project.images ?? [],
      inventories: project.inventories.map(inv => ({
        ...inv,
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
  const exists = await this.prisma.project.findUnique({
    where: { id },
    include: { paymentPlans: true }, // لجلب الخطط القديمة
  });
  if (!exists) throw new NotFoundException('Project not found');

  // 2. تحقق من وجود المطور (إن وُجد)
  if (dto.developerId) {
    const developer = await this.prisma.developer.findUnique({
      where: { id: dto.developerId },
    });
    if (!developer) {
      throw new NotFoundException('Developer not found');
    }
  }

  // 3. تحقق من وجود المنطقة (إن وُجدت)
  if (dto.zoneId) {
    const zone = await this.prisma.zone.findUnique({
      where: { id: dto.zoneId },
    });
    if (!zone) {
      throw new NotFoundException('Zone not found');
    }
  }

  // 4. تحقق من عدم تكرار الاسم
  if (dto.nameEn && dto.nameEn !== exists.nameEn) {
    const nameExists = await this.prisma.project.findFirst({
      where: {
        nameEn: dto.nameEn,
        id: { not: id },
      },
    });
    if (nameExists) {
      throw new ConflictException('Project with this name already exists');
    }
  }

  // 5. تحديث بيانات المشروع
  const updatedProject = await this.prisma.project.update({
    where: { id },
    data: {
      ...(dto.nameEn && { nameEn: dto.nameEn }),
      ...(dto.nameAr && { nameAr: dto.nameAr }),
      ...(dto.location && { location: dto.location }),
      ...(dto.description && { description: dto.description }),
      ...(dto.images && { images: dto.images }),
      ...(dto.developerId && { developerId: dto.developerId }),
      ...(dto.zoneId && { zoneId: dto.zoneId }),
    },
    include: {
      developer: true,
      zone: true,
      inventories: true,
      paymentPlans: true,
    },
  });

  // 6. تحديث خطط الدفع (اختياري)
  if (dto.paymentPlans && dto.paymentPlans.length > 0) {
    // حذف الخطط القديمة (اختياري حسب احتياجك)
    await this.prisma.paymentPlan.deleteMany({
      where: { projectId: id },
    });

    // إنشاء الخطط الجديدة
    for (const plan of dto.paymentPlans) {
      await this.prisma.paymentPlan.create({
        data: {
          ...plan,
          downpayment: plan.downPayment, // تأكد من تطابق الاسم مع Prisma schema
          projectId: id,
        },
      });
    }
  }

  // 7. تسجيل اللوج
  await this.logsService.createLog({
    userId,
    email,
    userRole,
    action: 'update_project',
    description: `Updated project: id=${id}, name=${updatedProject.nameEn}, location=${updatedProject.location}`,
  });

  // 8. الاستجابة
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
      include: { inventories: true }
    });
    if (!exists) throw new NotFoundException('Project not found');

    // Check if project has inventories
    if (exists.inventories.length > 0) {
      throw new ConflictException('Cannot delete project with existing inventories');
    }

    await this.prisma.project.delete({ where: { id } });

    // Log project deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_project',
      description: `Deleted project: id=${id}, name=${exists.nameEn}`,
    });

    return {
      status: 200,
      message: 'Project deleted successfully'
    };
  }

 
}
