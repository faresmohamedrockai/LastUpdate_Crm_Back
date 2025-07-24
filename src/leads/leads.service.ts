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

    // Helper function to convert budget safely
    const convertBudget = (value: number | string | undefined): number => {
      if (value === undefined || value === null || value === '') return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    const budget = convertBudget(dto.budget);
    
    // Validate budget is not negative
    if (budget < 0) {
      throw new BadRequestException('Budget must be greater than or equal to 0');
    }

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
      email: dto.email,
      budget: budget,
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
        budget: lead.budget?.toString() ?? null,
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

  // ✅ تحويل التواريخ كلها إلى toISOString()
  const parsedLeads = leads.map(lead => ({
    ...lead,
    createdAt: lead.createdAt?.toISOString(),
    updatedAt: lead.updatedAt?.toISOString?.(),
    owner: lead.owner
      ? {
          ...lead.owner,
          createdAt: lead.owner.createdAt?.toISOString?.(),
        }
      : null,
    calls: lead.calls?.map(call => ({
      ...call,
      createdAt: call.createdAt?.toISOString?.(),
    })) || [],
  }));

  return { leads: parsedLeads };
}

  async getLeadById(leadId: string, user: { id: string; role: Role }) {
    const { role, id: userId } = user;
    
    let lead;
    
    switch (role) {
      case Role.ADMIN:
      case Role.SALES_ADMIN:
        // Admins can access any lead
        lead = await this.prisma.lead.findUnique({
          where: { id: leadId },
          include: {
            owner: {
              select: { id: true, name: true, email: true }
            },
            inventoryInterest: {
              select: { id: true, title: true, titleEn: true, titleAr: true }
            }
          }
        });
        break;

      case Role.TEAM_LEADER:
        // Team leaders can access leads assigned to their team members
        const teamMembers = await this.prisma.user.findMany({
          where: { teamLeaderId: userId },
          select: { id: true },
        });
        const memberIds = teamMembers.map(member => member.id);
        
        lead = await this.prisma.lead.findFirst({
          where: { 
            id: leadId,
            ownerId: { in: memberIds }
          },
          include: {
            owner: {
              select: { id: true, name: true, email: true }
            },
            inventoryInterest: {
              select: { id: true, title: true, titleEn: true, titleAr: true }
            }
          }
        });
        break;

      case Role.SALES_REP:
        // Sales reps can only access their own leads
        lead = await this.prisma.lead.findFirst({
          where: { 
            id: leadId,
            ownerId: userId
          },
          include: {
            owner: {
              select: { id: true, name: true, email: true }
            },
            inventoryInterest: {
              select: { id: true, title: true, titleEn: true, titleAr: true }
            }
          }
        });
        break;

      default:
        throw new ForbiddenException('Access denied');
    }

    if (!lead) {
      throw new NotFoundException('Lead not found or access denied');
    }

    // Return data in the format expected by the form
    return {
      id: lead.id,
      nameEn: lead.nameEn || '',
      nameAr: lead.nameAr || '',
      contact: lead.contact || '',
      email: lead.email || '',
      budget: Number(lead.budget) || 0,
      inventoryInterestId: lead.inventoryInterestId || '',
      source: lead.source || '',
      status: lead.status || 'fresh_lead',
      assignedToId: lead.ownerId || '', // Map ownerId back to assignedToId for form
      // Additional fields
      notes: lead.notes || [],
      lastCall: lead.lastCall,
      lastVisit: lead.lastVisit,
      createdAt: lead.createdAt?.toISOString(),
      // Include related data for reference
      owner: lead.owner,
      inventoryInterest: lead.inventoryInterest
    };
  }


  async updateLead(leadId: string, dto: UpdateLeadDto, user: { id: string; role: Role }, email?: string, userRole?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) throw new NotFoundException('Lead not found');

    const { role, id: userId } = user;

    // Helper function to convert budget safely
    const convertBudget = (value: number | string | undefined): number => {
      if (value === undefined || value === null || value === '') return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    // Prepare update data with fallback values as requested
    const updateData = {
      nameEn: dto.nameEn !== undefined ? dto.nameEn || '' : lead.nameEn || '',
      nameAr: dto.nameAr !== undefined ? dto.nameAr || '' : lead.nameAr || '',
      contact: dto.contact !== undefined ? dto.contact || '' : lead.contact || '',
      email: dto.email !== undefined ? dto.email || '' : lead.email || '',
      budget: dto.budget !== undefined ? convertBudget(dto.budget) : Number(lead.budget) || 0,
      inventoryInterestId: dto.inventoryInterestId !== undefined 
        ? (dto.inventoryInterestId || null) 
        : lead.inventoryInterestId || null,
      source: dto.source !== undefined ? dto.source || '' : lead.source || '',
      status: dto.status || lead.status || 'fresh_lead',
      // Map assignedToId to ownerId for database
      ownerId: dto.assignedToId !== undefined 
        ? (dto.assignedToId || null) 
        : lead.ownerId || null,
    };

    // Validate budget is not negative
    if (updateData.budget < 0) {
      throw new BadRequestException('Budget must be greater than or equal to 0');
    }

    // Sales Rep: limited update permissions
    if (role === Role.SALES_REP) {
      if (lead.ownerId !== userId) {
        throw new ForbiddenException('You can only edit your own leads');
      }

      // Sales Rep limited update - only specific fields
      const limitedUpdate: any = {};
      
      if (dto.status !== undefined) {
        limitedUpdate.status = dto.status || lead.status || 'fresh_lead';
      }
      if (dto.notes !== undefined) {
        limitedUpdate.notes = dto.notes;
      }
      if (dto.budget !== undefined) {
        const budgetValue = convertBudget(dto.budget);
        if (budgetValue < 0) {
          throw new BadRequestException('Budget must be greater than or equal to 0');
        }
        limitedUpdate.budget = budgetValue;
      }
      if (dto.inventoryInterestId !== undefined) {
        limitedUpdate.inventoryInterestId = dto.inventoryInterestId || null;
      }

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

    // Admin/Sales Admin/Team Leader: full update permissions
    // Validate assignedToId if provided
    if (updateData.ownerId) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: updateData.ownerId },
      });
      if (!assignedUser) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    // Validate inventoryInterestId if provided
    if (updateData.inventoryInterestId) {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id: updateData.inventoryInterestId },
      });
      if (!inventory) {
        throw new NotFoundException('Inventory item not found');
      }
    }

    // Perform the update with all the prepared data
    const updatedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        nameAr: updateData.nameAr,
        nameEn: updateData.nameEn,
        contact: updateData.contact,
        email: updateData.email,
        budget: updateData.budget,
        source: updateData.source,
        status: updateData.status,
        ownerId: updateData.ownerId,
        inventoryInterestId: updateData.inventoryInterestId,
        // Handle additional fields if provided
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.lastCall !== undefined && { lastCall: dto.lastCall }),
        ...(dto.lastVisit !== undefined && { lastVisit: dto.lastVisit }),
      },
    });

    // Log full lead update
    await this.logsService.createLog({
      userId,
      email,
      userRole,
      action: 'update_lead',
      leadId: leadId,
      description: `Updated lead: id=${leadId}, name=${updateData.nameEn}, contact=${updateData.contact}, status=${updateData.status}`,
    });

    return updatedLead;
  }

  async deleteLead(leadId: string, userId: string, email: string, role: string) {
    const existingLead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { calls: true, visits: true, meetings: true },
    });


    // Log lead deletion
  


    if (!existingLead) {
      throw new NotFoundException('Lead not found');
    }

    // Check if lead has related data
    if (existingLead.calls.length > 0 || existingLead.visits.length > 0 || existingLead.meetings.length > 0) {
      throw new ConflictException('Cannot delete lead with existing calls, visits, or meetings');
    }

    await this.logsService.createLog({
      userId,
      email,
      userRole:role,
      action: 'delete_lead',
      leadId: leadId,
      description: `Deleted lead: id=${leadId}, name=${existingLead.nameEn}, contact=${existingLead.contact}`,
    });



    await this.prisma.lead.delete({ where: { id: leadId } });

    return {
      status: 200,
      message: 'Lead deleted successfully',
    };
  }
}

















