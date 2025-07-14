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

  async createMeeting(dto: CreateMeetingDto, userId: string, userName: string, userRole: string) {
    const meeting = await this.prisma.meeting.create({
      data: {
        date: new Date(dto.date),
        status: dto.status,
        notes: dto.notes,
        objections: dto.objections,
        location: dto.location,
        lead: { connect: { id: dto.leadId } },
        createdBy: { connect: { id: userId } },
        ...(dto.inventoryId && { inventory: { connect: { id: dto.inventoryId } } }),
        ...(dto.projectId && { project: { connect: { id: dto.projectId } } }),
      },
      include: {
        lead: true,
        inventory: true,
        project: true,
      },
    });

    // Log meeting creation
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'create_meeting',
      leadId: dto.leadId,
      description: `Created meeting for lead ${dto.leadId}: status=${meeting.status}, date=${meeting.date}`,
    });

    return {
      status: 201,
      message: 'Meeting created successfully',
      data: meeting,
    };
  }








  
  async getAllMeetings(userId: string, userName: string, userRole: string) {
    const meetings = await this.prisma.meeting.findMany({
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_all_meetings',
      description: `Retrieved ${meetings.length} meetings`,
    });
    return meetings;
  }







  async getMeetingById(id: string, userId: string, userName: string, userRole: string) {




    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_meeting_by_id',
      leadId: meeting.leadId,
      description: `Retrieved meeting: id=${id}, lead=${meeting.leadId}, status=${meeting.status}`,
    });
    return meeting;
  }

















  async updateMeeting(id: string, dto: UpdateMeetingDto, userId: string, userName: string, userRole: string) {
    const existingMeeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!existingMeeting) {
      throw new NotFoundException('Meeting not found');
    }

    const updatedMeeting = await this.prisma.meeting.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.status && { status: dto.status }),
        ...(dto.notes && { notes: dto.notes }),
        ...(dto.objections && { objections: dto.objections }),
        ...(dto.location && { location: dto.location }),
        ...(dto.inventoryId && { inventory: { connect: { id: dto.inventoryId } } }),
        ...(dto.projectId && { project: { connect: { id: dto.projectId } } }),
      },
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
      },
    });

    // Log meeting update
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'update_meeting',
      leadId: existingMeeting.leadId,
      description: `Updated meeting ${id}: status=${updatedMeeting.status}, date=${updatedMeeting.date}`,
    });

    return {
      status: 200,
      message: 'Meeting updated successfully',
      data: updatedMeeting,
    };
  }










  async deleteMeeting(id: string, userId: string, userName: string, userRole: string) {
    const existingMeeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!existingMeeting) {
      throw new NotFoundException('Meeting not found');
    }

    await this.prisma.meeting.delete({ where: { id } });

    // Log meeting deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_meeting',
      leadId: existingMeeting.leadId,
      description: `Deleted meeting ${id} for lead ${existingMeeting.leadId}`,
    });

    return {
      status: 200,
      message: 'Meeting deleted successfully',
    };
  }

  async getMeetingsByLead(leadId: string, userId: string, userName: string, userRole: string) {



    
    const meetings = await this.prisma.meeting.findMany({
      where: { leadId },
      include: {
        inventory: true,
        project: true,
        createdBy: true,
      },
      orderBy: { date: 'desc' },
    });



    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_meetings_by_lead',
      leadId,
      description: `Retrieved ${meetings.length} meetings for lead: ${leadId}`,
    });
    return meetings;
  }
} 