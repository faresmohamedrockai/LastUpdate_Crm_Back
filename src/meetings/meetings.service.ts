import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) { }

  async createMeeting(
  dto: CreateMeetingDto,
  userId: string,
  email: string,
  role: string,
) {
  const meeting = await this.prisma.meeting.create({
    data: {
      // الحقول الأساسية
      title: dto.title,
      client: dto.client,
      date: dto.date ? dto.date : null,
      time: dto.time,
      duration: dto.duration,
      type: dto.type,
      status: dto.status,
      locationType: dto.locationType,
      notes: dto.notes,
      objections: dto.objections,
      location: dto.location,

      // علاقات
      ...(dto.leadId && {
        lead: {
          connect: { id: dto.leadId },
        },
      }),
      ...(dto.inventoryId && {
        inventory: {
          connect: { id: dto.inventoryId },
        },
      }),
      ...(dto.projectId && {
        project: {
          connect: { id: dto.projectId },
        },
      }),
      ...(dto.assignedToId && {
        assignedTo: {
          connect: { id: dto.assignedToId },
        },
      }),

      // المستخدم المنشئ
      createdBy: {
        connect: { id: userId },
      },
    },
    include: {
      lead: true,
      inventory: true,
      project: true,
      assignedTo: true,
      createdBy: true,
    },
  });

  // سجل عملية الإنشاء
  await this.logsService.createLog({
    userId,
    email,
    userRole:role,
    leadId: dto.leadId,
    action: 'create_meeting',
    description: `Created meeting: ${dto.title || ''} for lead ${dto.leadId || 'N/A'}`,
  });

  return {
    status: 201,
    message: 'Meeting created successfully',
    meetings: meeting,
  };
}








  
async getAllMeetings(
  userId: string,
  email: string,
  role: string,
) {
  const meetings = await this.prisma.meeting.findMany({
    include: {
      lead: true,
      inventory: true,
      project: true,
      createdBy: true,
      assignedTo: true, // ✅ إضافة الحقل الجديد
    },
    orderBy: {
      createdAt: 'desc',
    },
  });


  return {
    status: 200,
    message: 'Meetings retrieved successfully',
    meetings: meetings,
  };
}








  

















 async updateMeeting(
  id: string,
  dto: UpdateMeetingDto,
  userId: string,
  email: string,
  role: string,

) {
  const existingMeeting = await this.prisma.meeting.findUnique({
    where: { id },
  });

  if (!existingMeeting) {
    throw new NotFoundException('Meeting not found');
  }

  const updatedMeeting = await this.prisma.meeting.update({
    where: { id },
    data: {
      ...(dto.title && { title: dto.title }),
      ...(dto.client && { client: dto.client }),
      ...(dto.date && { date: dto.date }),
      ...(dto.time && { time: dto.time }),
      ...(dto.duration && { duration: dto.duration }),
      ...(dto.type && { type: dto.type }),
      ...(dto.status && { status: dto.status }),
      ...(dto.location && { location: dto.location }),
      ...(dto.locationType && { locationType: dto.locationType }),
      ...(dto.notes && { notes: dto.notes }),
      ...(dto.objections && { objections: dto.objections }),
      ...(dto.location && { location: dto.location }),

      ...(dto.leadId && {
        lead: { connect: { id: dto.leadId } },
      }),
      ...(dto.inventoryId && {
        inventory: { connect: { id: dto.inventoryId } },
      }),
      ...(dto.projectId && {
        project: { connect: { id: dto.projectId } },
      }),
      ...(dto.assignedToId && {
        assignedTo: { connect: { id: dto.assignedToId } },
      }),
    },
    include: {
      lead: true,
      inventory: true,
      project: true,
      createdBy: true,
      assignedTo: true,
    },
  });

  // Log the update
  await this.logsService.createLog({
    userId,
    userRole:role,
    email,
    
leadId: (dto.leadId || existingMeeting.leadId) ?? undefined,

    action: 'update_meeting',
    description: `Updated meeting ${id}: status=${updatedMeeting.status}, date=${updatedMeeting.date}`,
  });

  return {
    status: 200,
    message: 'Meeting updated successfully',
    meetings: updatedMeeting,
  };
}











  async deleteMeeting(id: string, userId: string, email: string, role: string) {
    const existingMeeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!existingMeeting) {
      throw new NotFoundException('Meeting not found');
    }

    await this.prisma.meeting.delete({ where: { id } });

    // Log meeting deletion
    await this.logsService.createLog({
      userId,
      email,
      userRole:role,
      action: 'delete_meeting',
      leadId: existingMeeting.leadId ?? undefined,
      description: `Deleted meeting ${id} for lead ${existingMeeting.leadId}`,
    });

    return {
      status: 200,
      message: 'Meeting deleted successfully',
    };
  }


} 