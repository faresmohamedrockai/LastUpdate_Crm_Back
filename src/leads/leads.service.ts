import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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
  ) { }

  async create(dto: CreateLeadDto, userId: string, email?: string, userRole?: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required to create a lead');
    }
    console.log(dto);


    const existingLead = await this.prisma.lead.findUnique({
      where: { contact: dto.contact },
    });

    if (existingLead) {
      throw new ConflictException('Lead with this contact already exists');
    }


    const leadData: any = {

      nameEn: dto.nameEn,
      nameAr: dto.nameAr,
      contact: dto.contact,
      notes: dto.notes,
      budget: typeof dto.budget === 'number' ? String(dto.budget) : dto.budget,
      source: dto.source,
      status: dto.status,

      owner: {
        connect: { id: dto.assignedToId },
      },
    };

    if (dto.lastCall) {
      leadData.lastCall = new Date(dto.lastCall);
    }

    if (dto.lastVisit) {
      leadData.lastVisit = new Date(dto.lastVisit);
    }
    if (dto.inventoryInterestId) {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id: dto.inventoryInterestId },
      });
      if (!inventory) {
        throw new NotFoundException('Inventory item not found');
      }

      leadData.inventoryInterest = {
        connect: { id: dto.inventoryInterestId },
      };
    }

    const lead = await this.prisma.lead.create({
      data: leadData,
      include: {
        inventoryInterest: true,
      },
    });

    return {
      status: 201,
      message: 'Lead created successfully',
      data: {
        ...lead,
        inventory: lead.inventoryInterest ?? null,
        properties: [], // ⬅️ نجهزها لاحقًا أو تفضل فاضية
      },
    };
  }


 async getLeads(id: string, email: string, userRole?: string) {
  let leads;
  let description;

  switch (userRole) {
    case Role.ADMIN:
    case Role.SALES_ADMIN:
      leads = await this.prisma.lead.findMany({
        include: {
          owner: true,
          calls: true,
        },
      });
      description = `Admin retrieved ${leads.length} leads`;
      break;





    case Role.TEAM_LEADER:
      const teamMembers = await this.prisma.user.findMany({
        where: { teamLeaderId: id },
        select: { id: true },
      });

      const memberIds = teamMembers.map(member => member.id);

      leads = await this.prisma.lead.findMany({
        where: { ownerId: { in: memberIds } },
        include: {
          owner: true,
          calls: true, 
        },
      });
      description = `Team leader retrieved ${leads.length} leads for team`;
      break;

    case Role.SALES_REP:
      leads = await this.prisma.lead.findMany({
        where: { ownerId: id },
        include: {
          owner: true,
          calls: true, 
        },
      });
      description = `Sales rep retrieved ${leads.length} leads`;
      break;

    default:
      throw new ForbiddenException('Access denied');
  }

 

  return { leads };
}




  async updateLead(leadId: string, dto: UpdateLeadDto, user: { id: string; role: Role }, email?: string, userRole?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) throw new NotFoundException('Lead not found');

    const { role, id: userId } = user;

    // Sales Rep: فقط يعدل status و notes
    if (role === Role.SALES_REP) {
      if (lead.ownerId !== userId) {
        throw new ForbiddenException('You can only edit your own leads');
      }

      // Sales Rep limited update
      const limitedUpdate = {
        ...(dto.status && { status: dto.status }),
        ...(dto.assignedToId && { ownerId: dto.assignedToId }),
          ...(dto.notes !== undefined && { notes: dto.notes })
};
      



      const updatedLead = await this.prisma.lead.update({
        where: { id: leadId },
        data: limitedUpdate,
      });

      // Log limited lead update
      await this.logsService.createLog({
        userId,
        email,
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
    nameAr: dto.nameAr,
    nameEn: dto.nameEn,
    contact: dto.contact,
    budget: Number(dto.budget),
    source: dto.source,
    status: dto.status,
    notes: dto.notes !== undefined ? dto.notes : undefined, // ✅ المهم هنا
    lastCall: dto.lastCall,
    lastVisit: dto.lastVisit,
    inventoryInterestId: dto.inventoryInterestId,
  },
});


    // Log full lead update
    await this.logsService.createLog({
      userId,
      email,
      userRole,
      action: 'update_lead',
      // leadId: leadId,
      description: `Updated lead: id=${leadId}, name=${dto.nameEn}, contact=${dto.contact}, status=${dto.status}`,
    });

    return updatedLead;
  }

  async deleteLead(leadId: string, userId: string, email: string, role: string) {
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
      email,
      userRole:role,
      action: 'delete_lead',
      leadId: leadId,
      description: `Deleted lead: id=${leadId}, name=${existingLead.nameEn}, contact=${existingLead.contact}`,
    });

    return {
      status: 200,
      message: 'Lead deleted successfully',
    };
  }
}

















