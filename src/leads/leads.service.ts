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

  async create(dto: CreateLeadDto, userId: string, email: string, userRole: string) {
    // ✅ التحقق من المعطيات الأساسية
    if (!userId) throw new BadRequestException('User ID is required to create a lead');
    if (!email || !userRole) throw new ForbiddenException('Email and user role are required');

    // ✅ التحقق من صلاحية الدور
    if (!Object.values(Role).includes(userRole as Role)) {
      throw new ForbiddenException('Invalid user role');
    }

    // ✅ التحقق من وجود المستخدم في قاعدة البيانات
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true }
    });

    if (!dbUser) throw new ForbiddenException('User not found in database');
    if (dbUser.role !== userRole) throw new ForbiddenException('Role mismatch');
    if (dbUser.email !== email) throw new ForbiddenException('Email mismatch');

    // ✅ دالة تحويل الميزانية
    const convertBudget = (value: number | string | undefined): number => {
      if (value === undefined || value === null || value === '') return 0;
      if (typeof value === 'number') return value;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const budget = convertBudget(dto.budget);
    if (budget < 0) throw new BadRequestException('Budget must be >= 0');

    // ✅ التحقق من عدم وجود أي contact مكرر في contacts array
    if (dto.contacts && dto.contacts.length > 0) {
      const existingLead = await this.prisma.lead.findFirst({
        where: {
          OR: dto.contacts.map(c => ({
            contacts: { has: c } // لو contact في DB عبارة عن array
          }))
        }
      });
      if (existingLead) throw new ConflictException('Lead with one of these contacts already exists');
    }

    // ✅ التحقق من contact الفردي
    if (dto.contact) {
      const existingLead = await this.prisma.lead.findFirst({
        where: {
          contact: dto.contact
        }
      });
      if (existingLead) throw new ConflictException('Lead with this contact already exists');
    }

    // ✅ تجهيز بيانات الـ Lead
    const leadData: any = {
      nameEn: dto.nameEn,
      nameAr: dto.nameAr,
      description: dto.description,
      otherProject: dto.otherProject,
      familyName: dto.familyName,
      contact: dto.contact ?? '',
      contacts: dto.contacts ?? [],
      notes: dto.notes,
      email: dto.email,
      cil:dto.cil,
      interest: dto.interest,
      tier: dto.tier,
      budget,
      source: dto.source,
      status: dto.status,
      owner: dto.assignedToId ? { connect: { id: dto.assignedToId } } : undefined
    };

    if (dto.lastCall) leadData.lastCall = new Date(dto.lastCall);
    if (dto.firstConection) leadData.firstConection = new Date(dto.firstConection);
    if (dto.lastVisit) leadData.lastVisit = new Date(dto.lastVisit);

    if (dto.inventoryInterestId) {
      const inventory = await this.prisma.inventory.findUnique({ where: { id: dto.inventoryInterestId } });
      if (!inventory) throw new NotFoundException('Inventory item not found');
      leadData.inventoryInterest = { connect: { id: dto.inventoryInterestId } };
    }
    if (dto.projectInterestId) {
      const project = await this.prisma.project.findUnique({ where: { id: dto.projectInterestId } });
      if (!project) throw new NotFoundException('Project not found');
      leadData.projectInterest = { connect: { id: dto.projectInterestId } };
    }
    console.log("Data For Leads Create", leadData);

    // ✅ إنشاء الـ Lead في قاعدة البيانات
    const lead = await this.prisma.lead.create({
      data: leadData,
      include: { inventoryInterest: true, projectInterest: true },
    });

    return {
      status: 201,
      message: 'Lead created successfully',
      data: {
        ...lead,
        budget: lead.budget?.toString() ?? null,
        inventory: lead.inventoryInterest ?? null,
        projectInterest: lead.projectInterest ?? null,
        properties: [],
      },
    };
  }



  async getLeads(id: string, email: string, userRole: string) {
    // 🔒 SECURITY FIX: Validate userRole parameter
    if (!userRole) {
      throw new ForbiddenException('User role is required');
    }

    // Validate that the role is a valid enum value
    if (!Object.values(Role).includes(userRole as Role)) {
      throw new ForbiddenException('Invalid user role');
    }

    // 🔒 SECURITY FIX: Validate user exists and role matches
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.role !== userRole) {
      throw new ForbiddenException('Role mismatch - potential security breach');
    }

    if (user.email !== email) {
      throw new ForbiddenException('Email mismatch - potential security breach');
    }

    let leads;
    let description;

    switch (userRole) {
      case Role.ADMIN:
      case Role.SALES_ADMIN:
        leads = await this.prisma.lead.findMany({
          include: {
            owner: true,
            calls: true,
            inventoryInterest: {
              include: { project: true }
            },
            projectInterest:true
            ,
            meetings: {
              include: {
                createdBy: true,
                assignedTo: true,
                project: true,
                inventory: true
              }
            }
          }
        });

        description = `Admin retrieved ${leads.length} leads with meetings`;

        description = `Admin retrieved ${leads.length} leads`;
        break;

      case Role.TEAM_LEADER:
        // First, get team members
        const teamMembers = await this.prisma.user.findMany({
          where: { teamLeaderId: id },
          select: { id: true },
        });

        const memberIds = teamMembers.map(member => member.id);
        // Include team leader's own ID along with team members
        const allIds = [...memberIds, id].filter(id => id !== undefined && id !== null);

        leads = await this.prisma.lead.findMany({
          where: { ownerId: { in: allIds } },
          include: {
            owner: true,
            inventoryInterest: {
              include:
              {
                project: {
                  select: {
                    nameEn: true,
                    nameAr: true
                  }
                }

              }
            },
            calls: true,
          },
        });
        description = `Team leader retrieved ${leads.length} leads for team and self`;
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
      createdAt: lead.createdAt ? lead.createdAt?.toLocaleDateString('en-GB') : null,
      firstConection: lead.firstConection ? lead.firstConection.toLocaleDateString('en-GB') : null
      ,

      owner: lead.owner
        ? {
          ...lead.owner,
          createdAt: lead.owner.createdAt?.toISOString?.(),
        }
        : null,
      calls: lead.calls?.map(call => ({
        ...call,
        createdAt: call.createdAt ? call.createdAt?.toLocaleDateString('en-GB') : null,
      })) || [],
    }));

    return { leads: parsedLeads };
  }

  async getLeadsByOwnerId(userId: string) {
    const leads = await this.prisma.lead.findMany({
      where: { ownerId: userId },
      include: {
        owner: true,
        calls: true,
        inventoryInterest: true,
      },
    });

    // Convert dates to ISO strings for consistent formatting
    const parsedLeads = leads.map(lead => ({
      ...lead,
      createdAt: lead.createdAt?.toISOString(),
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
    // 🔒 SECURITY FIX: Validate parameters
    if (!user || !user.id || !user.role) {
      throw new ForbiddenException('Valid user object with id and role is required');
    }

    // Validate that the role is a valid enum value
    if (!Object.values(Role).includes(user.role)) {
      throw new ForbiddenException('Invalid user role');
    }

    // 🔒 SECURITY FIX: Validate user exists and role matches database
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, email: true }
    });

    if (!dbUser) {
      throw new ForbiddenException('User not found in database');
    }

    if (dbUser.role !== user.role) {
      throw new ForbiddenException('Role mismatch with database - potential security breach');
    }

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
        // Team leaders can access leads assigned to their team members and their own leads
        const teamMembers = await this.prisma.user.findMany({
          where: { teamLeaderId: userId },
          select: { id: true },
        });
        const memberIds = teamMembers.map(member => member.id);
        // Include team leader's own ID along with team members' IDs
        const allIds = [...memberIds, userId];

        lead = await this.prisma.lead.findFirst({
          where: {
            id: leadId,
            ownerId: { in: allIds }
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


  async updateLead(
    leadId: string,
    dto: UpdateLeadDto,
    user: { id: string; role: Role },
    email: string,
    userRole: string
  ) {
    if (!email || !userRole) throw new ForbiddenException('Email and user role are required');
    if (!Object.values(Role).includes(userRole as Role)) throw new ForbiddenException('Invalid user role');
    if (user.role !== userRole) throw new ForbiddenException('User role mismatch');

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, email: true }
    });

    if (!dbUser) throw new ForbiddenException('User not found in database');
    if (dbUser.role !== userRole) throw new ForbiddenException('Role mismatch with database');
    if (dbUser.email !== email) throw new ForbiddenException('Email mismatch with database');

    const { role, id: userId } = user;
    let lead;

    switch (role) {
      case Role.ADMIN:
      case Role.SALES_ADMIN:
        lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
        break;
      case Role.TEAM_LEADER:
        const teamMembers = await this.prisma.user.findMany({
          where: { teamLeaderId: userId },
          select: { id: true },
        });
        const allIds = [...teamMembers.map(m => m.id), userId];
        lead = await this.prisma.lead.findFirst({
          where: { id: leadId, ownerId: { in: allIds } }
        });
        break;
      case Role.SALES_REP:
        lead = await this.prisma.lead.findFirst({
          where: { id: leadId, ownerId: userId }
        });
        break;
      default:
        throw new ForbiddenException('Access denied');
    }

    if (!lead) throw new NotFoundException('Lead not found or access denied');

    const convertBudget = (value: number | string | undefined): number => {
      if (value === undefined || value === null || value === '') return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    let updateData: any;

    if (["admin", "sales_admin", "team_leader"].includes(userRole)) {
      updateData = {
        nameEn: dto.nameEn ?? lead.nameEn ?? '',
        nameAr: dto.nameAr ?? lead.nameAr ?? '',
        description: dto.description ?? lead.description ?? '',
        otherProject: dto.otherProject ?? lead.otherProject ?? '',
        familyName: dto.familyName ?? lead.familyName ?? '',
        // firstConection: dto.firstConection && new Date(dto.firstConection) ,
        contact: dto.contact ?? lead.contact ?? '',        // string منفرد
        contacts: dto.contacts ?? lead.contacts ?? [],    // array من strings 
        email: dto.email ?? lead.email ?? '',
        cil: dto.cil ?? lead.cil ?? false,
        interest: dto.interest ?? lead.interest ?? 'hot',
        tier: dto.tier ?? lead.tier ?? 'bronze',
        budget: dto.budget !== undefined ? convertBudget(dto.budget) : Number(lead.budget) || 0,
        inventoryInterestId: dto.inventoryInterestId ?? lead.inventoryInterestId ?? null,
        projectInterestId: dto.projectInterestId ?? lead.projectInterestId ?? null,
        source: dto.source ?? lead.source ?? '',
        status: dto.status || lead.status || 'fresh_lead',
        ownerId: dto.assignedToId ?? lead.ownerId ?? null,
      };
    } else {
      if (dto.nameEn === undefined && dto.nameAr === undefined && dto.inventoryInterestId === undefined) {
        throw new ForbiddenException('You are only allowed to update the client name and the property they are interested in.');
      }
      updateData = {
        nameEn: dto.nameEn ?? lead.nameEn ?? '',
        nameAr: dto.nameAr ?? lead.nameAr ?? '',
        description: dto.description ?? lead.description ?? '',
        cil: dto.cil ?? lead.cil ?? false,
        projectInterestId: dto.projectInterestId ?? lead.projectInterestId ?? null,
        otherProject: dto.otherProject ?? lead.otherProject ?? '',
      };
    }

    if (updateData.budget < 0) throw new BadRequestException('Budget must be >= 0');

    if (role === Role.SALES_REP) {
      if (lead.ownerId !== userId) throw new ForbiddenException('You can only edit your own leads');

      const limitedUpdate: any = {};
      if (dto.nameAr !== undefined) limitedUpdate.nameAr = dto.nameAr;
      if (dto.nameEn !== undefined) limitedUpdate.nameEn = dto.nameEn;
      if (dto.description !== undefined) limitedUpdate.description = dto.description;
      if (dto.cil !== undefined) limitedUpdate.cil = dto.cil;
      if (dto.otherProject !== undefined) limitedUpdate.otherProject = dto.otherProject;
      if (dto.familyName !== undefined) limitedUpdate.familyName = dto.familyName;
      if (dto.status !== undefined) limitedUpdate.status = dto.status || lead.status || 'fresh_lead';
      if (dto.notes !== undefined) limitedUpdate.notes = dto.notes;
      if (dto.budget !== undefined) {
        const budgetValue = convertBudget(dto.budget);
        if (budgetValue < 0) throw new BadRequestException('Budget must be >= 0');
        limitedUpdate.budget = budgetValue;
      }
      if (dto.inventoryInterestId !== undefined) limitedUpdate.inventoryInterestId = dto.inventoryInterestId || null;
      if (dto.projectInterestId !== undefined) limitedUpdate.projectInterestId = dto.projectInterestId || null;
      if (dto.contact !== undefined) limitedUpdate.contact = dto.contact; // string
      if (dto.contacts !== undefined) limitedUpdate.contacts = dto.contacts; // array

    if (dto.firstConection) limitedUpdate.firstConection = new Date(dto.firstConection);



      const updatedLead = await this.prisma.lead.update({
        where: { id: leadId },
        data: limitedUpdate,
      });

      await this.logsService.createLog({
        userId,
        email,
        userRole,
        action: 'Sales Rep Update',
        leadId: leadId,
        description: `Sales rep : ${email} updated lead: name=${updatedLead.nameAr}`,
      });

      return updatedLead;
    }







    if (updateData.ownerId) {
      const assignedUser = await this.prisma.user.findUnique({ where: { id: updateData.ownerId } });
      if (!assignedUser) throw new NotFoundException('Assigned user Not Found');
    }

    if (updateData.inventoryInterestId) {
      const inventory = await this.prisma.inventory.findUnique({ where: { id: updateData.inventoryInterestId } });
      if (!inventory) throw new NotFoundException('Inventory item not found');
    }













console.log("Updated Data Will Send",updateData);





   const updatedLead = await this.prisma.lead.update({
  where: { id: leadId },
  data: {
    nameAr: updateData.nameAr,
    nameEn: updateData.nameEn,
    description: updateData.description,
    familyName: updateData.familyName,
    firstConection: updateData.firstConection,
    contact: dto.contact ?? lead.contact ?? '',
    contacts: dto.contacts ?? lead.contacts ?? [],
    cil: dto.cil ?? lead.cil ?? false ,
    email: updateData.email,
    otherProject: updateData.otherProject,
    interest: updateData.interest,
    tier: updateData.tier,
    budget: updateData.budget,
    source: updateData.source,
    status: updateData.status,
    ownerId: updateData.ownerId,
    inventoryInterestId: updateData.inventoryInterestId,
    projectInterestId: updateData.projectInterestId, // 👈 ضيف دي
    ...(dto.notes !== undefined && { notes: dto.notes }),
    ...(dto.lastCall !== undefined && { lastCall: dto.lastCall }),
    ...(dto.lastVisit !== undefined && { lastVisit: dto.lastVisit }),
  },
});


    await this.logsService.createLog({
      userId,
      email,
      userRole,
      action: 'update_lead',
      leadId: leadId,
      description: `Updated lead: id=${leadId}, name=${updateData.nameEn}`,
    });

    return updatedLead;
  }

















  async deleteLead(leadId: string, userId: string, email: string, role: string) {
    // 🔒 SECURITY FIX: Validate parameters
    if (!userId || !email || !role) {
      throw new ForbiddenException('User ID, email, and role are required');
    }

    // Validate that the role is a valid enum value
    if (!Object.values(Role).includes(role as Role)) {
      throw new ForbiddenException('Invalid user role');
    }

    // 🔒 SECURITY FIX: Validate user exists and role matches database
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true }
    });

    if (!dbUser) {
      throw new ForbiddenException('User not found in database');
    }

    if (dbUser.role !== role) {
      throw new ForbiddenException('Role mismatch with database - potential security breach');
    }

    if (dbUser.email !== email) {
      throw new ForbiddenException('Email mismatch with database - potential security breach');
    }

    // 🔒 Access Control: Check if user can access this lead
    let existingLead;

    switch (role) {
      case Role.ADMIN:
      case Role.SALES_ADMIN:
        // Admins can access any lead
        existingLead = await this.prisma.lead.findUnique({
          where: { id: leadId },
          include: { calls: true, visits: true, meetings: true },
        });
        break;

      case Role.TEAM_LEADER:
        // Team leaders can access leads assigned to their team members and their own leads
        const teamMembers = await this.prisma.user.findMany({
          where: { teamLeaderId: userId },
          select: { id: true },
        });
        const memberIds = teamMembers.map(member => member.id);
        // Include team leader's own ID along with team members
        const allIds = [...memberIds, userId];

        existingLead = await this.prisma.lead.findFirst({
          where: {
            id: leadId,
            ownerId: { in: allIds }
          },
          include: { calls: true, visits: true, meetings: true },
        });
        break;

      case Role.SALES_REP:
        // Sales reps can only access their own leads
        existingLead = await this.prisma.lead.findFirst({
          where: {
            id: leadId,
            ownerId: userId
          },
          include: { calls: true, visits: true, meetings: true },
        });
        break;

      default:
        throw new ForbiddenException('Access denied');
    }

    if (!existingLead) {
      throw new NotFoundException('Lead not found or access denied');
    }

    // Role-based access control for deletion
    switch (role) {
      case Role.ADMIN:
      case Role.SALES_ADMIN:
        // Admins can delete any lead
        break;

      case Role.TEAM_LEADER:
        // Team leaders can delete their own leads and their team members' leads
        const teamMembers = await this.prisma.user.findMany({
          where: { teamLeaderId: userId },
          select: { id: true },
        });
        const memberIds = teamMembers.map(member => member.id);
        const allIds = [...memberIds, userId];

        if (existingLead.ownerId && !allIds.includes(existingLead.ownerId)) {
          throw new ForbiddenException('You can only delete leads owned by you or your team members');
        }
        break;

      case Role.SALES_REP:
        // Sales reps can only delete their own leads
        if (existingLead.ownerId !== userId) {
          throw new ForbiddenException('You can only delete your own leads');
        }
        break;

      default:
        throw new ForbiddenException('Access denied');
    }

    // Check if lead has related data
    if (existingLead.calls.length > 0 || existingLead.visits.length > 0 || existingLead.meetings.length > 0) {
      throw new ConflictException('Cannot delete lead with existing calls, visits, or meetings');
    }

    await this.logsService.createLog({
      userId,
      email,
      userRole: role,
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

















