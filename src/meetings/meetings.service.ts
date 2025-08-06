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

  /**
   * Helper method to check if a user can access a specific meeting
   */
  private async canAccessMeeting(
    meetingId: string,
    userId: string,
    role: string
  ): Promise<boolean> {
    // Admins and sales admins can access all meetings
    if (role === 'admin' || role === 'sales_admin') {
      return true;
    }

    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        createdById: true,
        assignedToId: true,
        createdBy: {
          select: { teamLeaderId: true }
        },
        assignedTo: {
          select: { teamLeaderId: true }
        }
      },
    });

    if (!meeting) {
      return false;
    }

    // Check if user created or is assigned to the meeting
    if (meeting.createdById === userId || meeting.assignedToId === userId) {
      return true;
    }

    // If user is team leader, check if they can access team members' meetings
    if (role === 'team_leader') {
      // Check if the meeting was created by a team member
      if (meeting.createdBy?.teamLeaderId === userId) {
        return true;
      }
      // Check if the meeting is assigned to a team member
      if (meeting.assignedTo?.teamLeaderId === userId) {
        return true;
      }
    }

    return false;
  }

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

    // // سجل عملية الإنشاء
    // await this.logsService.createLog({
    //   userId,
    //   email,
    //   userRole: role,
    //   leadId: dto.leadId || null,
    //   action: 'create_meeting',
    //   description: `Created meeting: ${dto.title || ''} for lead ${dto.leadId || 'N/A'}`,
    // });

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
    let whereClause: any = {};

    // Apply role-based filtering
    switch (role) {
      case 'sales_rep':
        // Sales reps can only see meetings they created or are assigned to
        whereClause = {
          OR: [
            { createdById: userId },
            { assignedToId: userId },
          ],
        };
        break;

      case 'team_leader':
        // Team leaders can see their own meetings + their team members' meetings
        // First, get the team members
        const teamMembers = await this.prisma.user.findMany({
          where: { teamLeaderId: userId },
          select: { id: true },
        });
        
        const teamMemberIds = teamMembers.map(member => member.id);
        
        whereClause = {
          OR: [
            // Own meetings (created or assigned)
            { createdById: userId },
            { assignedToId: userId },
            // Team members' meetings (created or assigned)
            { createdById: { in: teamMemberIds } },
            { assignedToId: { in: teamMemberIds } },
          ],
        };
        break;

      case 'sales_admin':
      case 'admin':
        // Sales admins and admins can see all meetings
        whereClause = {};
        break;

      default:
        // Default to sales_rep behavior for unknown roles
        whereClause = {
          OR: [
            { createdById: userId },
            { assignedToId: userId },
          ],
        };
        break;
    }

    const meetings = await this.prisma.meeting.findMany({
      where: whereClause,
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
        assignedTo: true,
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

  async getMeetingsByProject(
    projectId: string,
    userId: string,
    email: string,
    role: string,
  ) {
    let whereClause: any = {
      projectId: projectId,
    };

    // Apply role-based filtering similar to getAllMeetings
    switch (role) {
      case 'sales_rep':
        whereClause = {
          ...whereClause,
          OR: [
            { createdById: userId },
            { assignedToId: userId },
          ],
        };
        break;

      case 'team_leader':
        // Get team members
        const teamMembers = await this.prisma.user.findMany({
          where: { teamLeaderId: userId },
          select: { id: true },
        });
        
        const teamMemberIds = teamMembers.map(member => member.id);
        
        whereClause = {
          ...whereClause,
          OR: [
            // Own meetings
            { createdById: userId },
            { assignedToId: userId },
            // Team members' meetings
            { createdById: { in: teamMemberIds } },
            { assignedToId: { in: teamMemberIds } },
          ],
        };
        break;

      case 'sales_admin':
      case 'admin':
        // No additional filtering for admins
        break;

      default:
        // Default to sales_rep behavior
        whereClause = {
          ...whereClause,
          OR: [
            { createdById: userId },
            { assignedToId: userId },
          ],
        };
        break;
    }

    const meetings = await this.prisma.meeting.findMany({
      where: whereClause,
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
        assignedTo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      status: 200,
      message: 'Project meetings retrieved successfully',
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
    // 1. Check if meeting exists
    const existingMeeting = await this.prisma.meeting.findUnique({
      where: { id },
    });

    if (!existingMeeting) {
      throw new NotFoundException('Meeting not found');
    }

    // 2. Check if user can access this meeting
    const canAccess = await this.canAccessMeeting(id, userId, role);
    if (!canAccess) {
      throw new NotFoundException('Meeting not found or access denied');
    }

    // 2. تنفيذ التحديث بالحقول الموجودة فقط
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
        ...(dto.locationType && { locationType: dto.locationType }),
        ...(dto.notes && { notes: dto.notes }),
        ...(dto.objections && { objections: dto.objections }),
        ...(dto.location && { location: dto.location }),

       
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

    // 3. تسجيل التحديث في السجل (logs)
    const log = await this.prisma.log.create({
      data: {
        user: {
          connect: {
            id: userId, // تأكد أن هذا موجود في المتغيرات
          },
        },
       
        email,
       userRole: role,
        action: 'update_meeting',
        description: `Updated meeting : status=${dto.status}, date=${dto.date}`,
     
      },
    });


    // 4. الإرجاع
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

    // Check if user can access this meeting
    const canAccess = await this.canAccessMeeting(id, userId, role);
    if (!canAccess) {
      throw new NotFoundException('Meeting not found or access denied');
    }

    await this.prisma.meeting.delete({ where: { id } });

  


    return {
      status: 200,
      message: 'Meeting deleted successfully',
    };
  }


} 