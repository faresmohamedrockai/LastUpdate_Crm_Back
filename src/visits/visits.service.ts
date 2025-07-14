import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateVisitDto } from './dto/create-visits.dto';

@Injectable()
export class VisitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) {}

  async createVisit(dto: CreateVisitDto, userId: string, userName: string, userRole: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const inventory = await this.prisma.inventory.findUnique({ where: { id: dto.inventoryId } });
    if (!inventory) throw new NotFoundException('Inventory not found');

    const visit = await this.prisma.visit.create({
      data: {
        date: dto.date,
        status: dto.status,
        notes: dto.notes,
        leadId: dto.leadId,
        inventoryId: dto.inventoryId,
      },
      include: {
        lead: true,
        inventory: true,
      },
    });

    // Log visit creation
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'create_visit',
      description: `Visit for lead: name=${lead?.name}, contact=${lead?.contact}, budget=${lead?.budget}, status=${lead?.status}, notes=${visit.notes || 'none'} | Inventory: title=${inventory?.title}, price=${inventory?.price}`,
    });

    return { message: 'Visit created', data: visit };
  }

  async getAllVisits(userId: string, userName: string, userRole: string) {
    const visits = await this.prisma.visit.findMany({
      include: {
        lead: true,
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log visits retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_all_visits',
      description: `Retrieved ${visits.length} visits`,
    });

    return visits;
  }

  async getVisitById(id: string, userId: string, userName: string, userRole: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        lead: true,
        inventory: true,
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    // Log visit retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_visit_by_id',
      description: `Retrieved visit: id=${id}, lead=${visit.lead.name}, inventory=${visit.inventory.title}`,
    });

    return visit;
  }

  async updateVisit(id: string, dto: CreateVisitDto, userId: string, userName: string, userRole: string) {
    const existingVisit = await this.prisma.visit.findUnique({ where: { id } });
    if (!existingVisit) throw new NotFoundException('Visit not found');

    const lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const inventory = await this.prisma.inventory.findUnique({ where: { id: dto.inventoryId } });
    if (!inventory) throw new NotFoundException('Inventory not found');

    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        date: dto.date,
        status: dto.status,
        notes: dto.notes,
        leadId: dto.leadId,
        inventoryId: dto.inventoryId,
      },
      include: {
        lead: true,
        inventory: true,
      },
    });

    // Log visit update
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'update_visit',
      description: `Updated visit: id=${id}, lead=${lead.name}, inventory=${inventory.title}`,
    });

    return { message: 'Visit updated', data: updatedVisit };
  }

  async deleteVisit(id: string, userId: string, userName: string, userRole: string) {
    const existingVisit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        lead: true,
        inventory: true,
      },
    });
    if (!existingVisit) throw new NotFoundException('Visit not found');

    await this.prisma.visit.delete({ where: { id } });

    // Log visit deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_visit',
      description: `Deleted visit: id=${id}, lead=${existingVisit.lead.name}, inventory=${existingVisit.inventory.title}`,
    });

    return { message: 'Visit deleted successfully' };
  }
}
