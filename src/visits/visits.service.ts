import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateVisitDto } from './dto/create-visits.dto';
import { UpdateVisitDto } from './dto/update-visits.dto';
import { MeetingsService } from 'src/meetings/meetings.service';
@Injectable()
export class VisitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mettingsService: MeetingsService,
    private readonly logsService: LogsService,
  ) { }

 async createVisit(dto: CreateVisitDto, userId: string, leadId: string, email: string, role: string) {
  if (!userId || !leadId) {
    throw new BadRequestException('Missing required fields');
  }

  const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new NotFoundException('Lead not found');

  // ⬇️ نجهز بيانات الزيارة
  const visitData: any = {
    date: dto.date,
    notes: dto.notes,
    objections: dto.objections,
    createdById: userId,
    leadId,
    inventoryId: dto.inventoryId?.trim() || undefined,
  };

  const visit = await this.prisma.visit.create({
    data: visitData,
    include: {
      lead: true,
      inventory: true,
    },
  });

  // ⬇️ نجهز بيانات الميتنج
  const meetingData = {
    title: `Meeting for visit on ${dto.date}`,
    client: lead.nameEn || lead.nameAr || 'Unnamed Lead',
    date: dto.date,
    notes: dto.notes,
    objections: dto.objections,
    leadId: leadId,
    inventoryId: dto.inventoryId?.trim() || undefined,
    createdById: userId,
    status: dto.status || 'Scheduled',
    location: 'Client Location',
    locationType: 'visit',
  };

  // ⬇️ ننشئ الميتنج ونرجع الـ id
  const meeting = await this.mettingsService.createMeeting(meetingData, userId, email, role);

  // ⬇️ نحفظ الـ meetingId جوه الزيارة
  const updatedVisit = await this.prisma.visit.update({
    where: { id: visit.id },
    data: { meettingId: meeting.meeting.id },
    include: {
      lead: true,
      inventory: true,
    },
  });

  // ⬇️ نعمل لوج
  await this.logsService.createLog({
    userId,
    email,
    userRole: role,
    action: 'create_visit',
    description: `Visit for lead: name=${lead.nameEn}, contact=${lead.contact}, budget=${lead.budget}, status=${lead.status}, notes=${visit.notes || 'none'}, objections=${visit.objections || 'none'}`,
  });

  return { message: 'Visit created', data: updatedVisit };
}


  async updateVisit(id: string, dto: UpdateVisitDto, userId: string, email: string, role: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id } });
    if (!visit) throw new NotFoundException('Visit not found');
console.log(dto);

    // تحديث البيانات
   const updatedVisit = await this.prisma.visit.update({
  where: { id },
  data: {
    date: dto.date ?? visit.date,
    notes: dto.notes ?? visit.notes,
    objections: dto.objections ?? visit.objections,
    inventoryId: dto.inventoryId?.trim() || visit.inventoryId,
    status: dto?.status ?? visit.status ?? "scheduled",
  },
  include: {
    lead: true,
    inventory: true,
  },
});



if(dto.meettingId){
   await this.mettingsService.updateMeeting(dto.meettingId, {
   status: dto?.status ?? visit.status ?? "Scheduled",
    }, userId, email, role);

}


    return { message: 'Visit updated', data: updatedVisit };
  }




  async getAllVisits(userId: string, userName: string, userRole: string, id: string) {
    const visits = await this.prisma.visit.findMany({
      where: {
        leadId: id,
      },
      include: {
        lead: true,
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { visits };
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
    const leadName = existingVisit.lead?.nameEn || 'Unknown Lead';
    // Log visit deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_visit',
      description: `Deleted visit: id=${id}, lead=${leadName}`,
    });

    return { message: 'Visit deleted successfully' };
  }
}
