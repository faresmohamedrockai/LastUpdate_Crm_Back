import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCallDto } from './dto/create-calls.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class CallsService {
  constructor(
    private prisma: PrismaService, 
    private readonly logsService: LogsService
  ) {}

  async createCall(dto: CreateCallDto, userId: string, userName: string, userRole: string, ip?: string, userAgent?: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: dto.leadId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    // Validate project if provided
    if (dto.ProjectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.ProjectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const call = await this.prisma.call.create({
      data: {
        date: new Date(dto.date),
        outcome: dto.outcome,
        duration: dto.duration,
        notes: dto.notes,
        leadId: dto.leadId,
        projectId: dto.ProjectId
      },
      include: {
        lead: true,
        project: true,
      },
    });

    // Log call creation
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'create_call',
      leadId: dto.leadId,
      description: `Created call: lead=${lead.name}, outcome=${dto.outcome}, duration=${dto.duration}min, project=${call.project?.name || 'none'}, notes=${dto.notes || 'none'}`,
      ip,
      userAgent,
    });

    return {
      status: 201,
      message: 'Call created successfully',
      data: call,
    };
  }

  async getAllCalls(userId: string, userName: string, userRole: string) {
    const calls = await this.prisma.call.findMany({
      include: {
        lead: true,
        project: true,
      },
      orderBy: { date: 'desc' },
    });

    // Log calls retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_all_calls',
      description: `Retrieved ${calls.length} calls`,
    });

    return {
      status: 200,
      data: calls,
    };
  }

  async getCallById(id: string, userId: string, userName: string, userRole: string) {
    const call = await this.prisma.call.findUnique({
      where: { id },
      include: {
        lead: true,
        project: true,
      },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    // Log call retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_call_by_id',
      leadId: call.leadId,
      description: `Retrieved call: id=${id}, lead=${call.lead.name}, outcome=${call.outcome}`,
    });

    return {
      status: 200,
      data: call,
    };
  }

  async getCallsByLead(leadId: string, userId: string, userName: string, userRole: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const calls = await this.prisma.call.findMany({
      where: { leadId },
      include: {
        project: true,
      },
      orderBy: { date: 'desc' },
    });

    // Log calls retrieval by lead
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_calls_by_lead',
      leadId: leadId,
      description: `Retrieved ${calls.length} calls for lead: ${lead.name}`,
    });

    return {
      status: 200,
      data: calls,
    };
  }

  async getCallsByProject(projectId: string, userId: string, userName: string, userRole: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const calls = await this.prisma.call.findMany({
      where: { projectId },
      include: {
        lead: true,
      },
      orderBy: { date: 'desc' },
    });

    // Log calls retrieval by project
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_calls_by_project',
      description: `Retrieved ${calls.length} calls for project: ${project.name}`,
    });

    return {
      status: 200,
      data: calls,
    };
  }

  async updateCall(id: string, dto: CreateCallDto, userId: string, userName: string, userRole: string) {
    const existingCall = await this.prisma.call.findUnique({
      where: { id },
      include: {
        lead: true,
        project: true,
      },
    });
    if (!existingCall) throw new NotFoundException('Call not found');

    // Validate project if provided
    if (dto.ProjectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.ProjectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const updatedCall = await this.prisma.call.update({
      where: { id },
      data: {
        date: new Date(dto.date),
        outcome: dto.outcome,
        duration: dto.duration,
        notes: dto.notes,
        projectId: dto.ProjectId
      },
      include: {
        lead: true,
        project: true,
      },
    });

    // Log call update
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'update_call',
      leadId: existingCall.leadId,
      description: `Updated call: id=${id}, lead=${existingCall.lead.name}, outcome=${dto.outcome}, duration=${dto.duration}min`,
    });

    return {
      status: 200,
      message: 'Call updated successfully',
      data: updatedCall,
    };
  }

  async deleteCall(id: string, userId: string, userName: string, userRole: string) {
    const existingCall = await this.prisma.call.findUnique({
      where: { id },
      include: {
        lead: true,
        project: true,
      },
    });
    if (!existingCall) throw new NotFoundException('Call not found');

    await this.prisma.call.delete({ where: { id } });

    // Log call deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_call',
      leadId: existingCall.leadId,
      description: `Deleted call: id=${id}, lead=${existingCall.lead.name}, outcome=${existingCall.outcome}`,
    });

    return {
      status: 200,
      message: 'Call deleted successfully',
    };
  }
}
