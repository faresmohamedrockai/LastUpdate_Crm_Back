import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/auth/roles.enum';
import { UpdateLeadDto } from './dto/update.lead.dto';


@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

 async create(dto: CreateLeadDto, userId: string) {
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
//عملت اوبجكت عشان احقظ فيه الداتا 
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

  return {
    status: 201,
    message: 'Lead created successfully',
    data: lead,
  };
}




  async getLeads(user: { id: string; role: Role }) {
    switch (user.role) {
      case Role.ADMIN:
      case Role.SALES_ADMIN:
        return this.prisma.lead.findMany({
          include: { owner: true },
        });

      case Role.TEAM_LEADER:
        // Get team members' IDs
        const teamMembers = await this.prisma.user.findMany({
          where: { teamLeaderId: user.id },
          select: { id: true },
        });

        const memberIds = teamMembers.map(member => member.id);

        return this.prisma.lead.findMany({
          where: { ownerId: { in: memberIds } },
          include: { owner: true },
        });

      case Role.SALES_REP:
        return this.prisma.lead.findMany({
          where: { ownerId: user.id },
          include: { owner: true },
        });

      default:
        throw new ForbiddenException('Access denied');
    }
  }



  async updateLead(leadId: string, dto: UpdateLeadDto, user: { id: string; role: Role }) {
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

      return this.prisma.lead.update({
        where: { id: leadId },
        data: limitedUpdate,
      });
    }

   
    return this.prisma.lead.update({
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


  }



















}

















