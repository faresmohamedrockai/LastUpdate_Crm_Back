import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Role } from '../auth/roles.enum';
import { UpdateLeadDto } from './dto/update.lead.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private readonly logsService: LogsService,
  ) {}

  async create(dto: CreateLeadDto, userId: string, userName?: string, userRole?: string, ip?: string, userAgent?: string) {
    const existingLead = await this.prisma.lead.findUnique({
      where: { contact: dto.contact },
    });

    if (existingLead) {
      throw new ConflictException('Lead with this contact already exists');
    }

    if (dto.inventoryInterestId) {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id: dto.inventoryInterestId },
      });
      if (!inventory) {
        throw new NotFoundException('Inventory item not found');
      }
    }

    const leadData: any = {
      name: dto.name,
      contact: dto.contact,
      budget: dto.budget,
      leadSource: dto.leadSource,
      status: dto.status,
      owner: {
        connect: { id: userId },
      },
    };

    if (dto.lastCall) {
      leadData.lastCall = new Date(dto.lastCall);
    }
    if (dto.lastVisit) {
      leadData.lastVisit = new Date(dto.lastVisit);
    }
    if (dto.inventoryInterestId) {
      leadData.inventoryInterestId = dto.inventoryInterestId;
    }

    const lead = await this.prisma.lead.create({ data: leadData });

    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'create_lead',
      leadId: lead.id,
      description: `Created lead: name=${lead.name}, contact=${lead.contact}, budget=${lead.budget}, leadSource=${lead.leadSource}, status=${lead.status}, ownerId=${lead.ownerId}, inventoryInterestId=${lead.inventoryInterestId || 'none'}`,
      ip,
      userAgent,
    });

    return {
      status: 201,
      message: 'Lead created successfully',
      data: lead,
    };
  }

  async getLeads(user: { id: string; role: Role }, userName?: string, userRole?: string) {
    let leads;
    let description;

    switch (user.role) {
      case Role.ADMIN:
      case Role.SALES_ADMIN:
        leads = await this.prisma.lead.findMany({
          include: { owner: true },
        });
        description = `Admin retrieved ${leads.length} leads`;
        break;

      case Role.TEAM_LEADER:
        const teamMembers = await this.prisma.user.findMany({
          where: { teamLeaderId: user.id },
          select: { id: true },
        });

        const memberIds = teamMembers.map(member => member.id);

        leads = await this.prisma.lead.findMany({
          where: { ownerId: { in: memberIds } },
          include: { owner: true },
        });
        description = `Team leader retrieved ${leads.length} leads for team`;
        break;

      case Role.SALES_REP:
        leads = await this.prisma.lead.findMany({
          where: { ownerId: user.id },
          include: { owner: true },
        });
        description = `Sales rep retrieved ${leads.length} leads`;
        break;

      default:
        throw new ForbiddenException('Access denied');
    }

    // Log leads retrieval
    await this.logsService.createLog({
      userId: user.id,
      userName,
      userRole,
      action: 'get_leads',
      description,
    });

    return leads;
  }

  async getLeadById(leadId: string, userId: string, userName: string, userRole: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { owner: true },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Log lead retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_lead_by_id',
      leadId: leadId,
      description: `Retrieved lead: id=${leadId}, name=${lead.name}, contact=${lead.contact}`,
    });

    return lead;
  }

  async updateLead(leadId: string, dto: UpdateLeadDto, user: { id: string; role: Role }, userName?: string, userRole?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) throw new NotFoundException('Lead not found');

    const { role, id: userId } = user;

    // Sales Rep: فقط يعدل status و notes
    if (role === Role.SALES_REP) {
      if (lead.ownerId !== userId) {
        throw new ForbiddenException('You can only edit your own leads');
      }

      const limitedUpdate = {
        ...(dto.status && { status: dto.status }),
        ...(dto.notes && { notes: dto.notes }),
      };

      const updatedLead = await this.prisma.lead.update({
        where: { id: leadId },
        data: limitedUpdate,
      });

      // Log limited lead update
      await this.logsService.createLog({
        userId,
        userName,
        userRole,
        action: 'update_lead_limited',
        leadId: leadId,
        description: `Sales rep updated lead: id=${leadId}, status=${dto.status || 'unchanged'}, notes=${dto.notes ? 'updated' : 'unchanged'}`,
      });

      return updatedLead;
    }

    // Admin/Sales Admin/Team Leader: يعدل كل الحقول
    const updatedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        name: dto.name,
        contact: dto.contact,
        budget: dto.budget,
        leadSource: dto.leadSource,
        status: dto.status,
        notes: dto.notes,
        lastCall: dto.lastCall,
        lastVisit: dto.lastVisit,
        inventoryInterestId: dto.inventoryInterestId,
      },
    });

    // Log full lead update
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'update_lead_full',
      leadId: leadId,
      description: `Updated lead: id=${leadId}, name=${dto.name}, contact=${dto.contact}, status=${dto.status}`,
    });

    return updatedLead;
  }

  async deleteLead(leadId: string, userId: string, userName: string, userRole: string) {
    const existingLead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { calls: true, visits: true, meetings: true },
    });

    if (!existingLead) {
      throw new NotFoundException('Lead not found');
    }

    // Check if lead has related data
    if (existingLead.calls.length > 0 || existingLead.visits.length > 0 || existingLead.meetings.length > 0) {
      throw new ConflictException('Cannot delete lead with existing calls, visits, or meetings');
    }

    await this.prisma.lead.delete({ where: { id: leadId } });

    // Log lead deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_lead',
      leadId: leadId,
      description: `Deleted lead: id=${leadId}, name=${existingLead.name}, contact=${existingLead.contact}`,
    });

    return {
      status: 200,
      message: 'Lead deleted successfully',
    };
  }
}

















