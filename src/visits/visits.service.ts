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

  async createVisit(
  
  dto: CreateVisitDto,
  userId: string,
  userName: string,
  userRole: string,
  leadId: string,
) {
  const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new NotFoundException('Lead not found');

const visit = await this.prisma.visit.create({
  data: {
    date: dto.date,
    status: dto.status,
    notes: dto.notes,
    objections: dto.objections,
    createdById: userId,
    leadId: leadId,
    inventoryId: dto.inventoryId,
  },
  include: {
    lead: true,
    inventory: true,
  },
});


  await this.logsService.createLog({
    userId,
    userName,
    userRole,
    action: 'create_visit',
    description: `Visit for lead: name=${lead?.nameEn}, contact=${lead?.contact}, budget=${lead?.budget}, status=${lead?.status}, notes=${visit.notes || 'none'}, objections=${visit.objections || 'none'} `,
  });

  return { message: 'Visit created', data: visit };
}


 async getAllVisits(userId: string, userName: string, userRole: string, id: string) {
  const visits = await this.prisma.visit.findMany({
    where: {
      leadId: id,
    },
    include: {
      lead: true,
   
    },
    orderBy: { createdAt: 'desc' },
  });

  

  return {visits};
}




 

  async deleteVisit(id: string, userId: string, userName: string, userRole: string) {
    const existingVisit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        lead: true,
   
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
      description: `Deleted visit: id=${id}, lead=${existingVisit.lead.nameEn}`,
    });

    return { message: 'Visit deleted successfully' };
  }
}
