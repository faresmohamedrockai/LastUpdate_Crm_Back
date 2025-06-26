import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCallDto } from './dto/create-calls.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CallsService {
constructor(private prisma:PrismaService){}



      async createCall(dto: CreateCallDto) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: dto.leadId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const call = await this.prisma.call.create({
      data: {
        date: new Date(dto.date),
        outcome: dto.outcome,
        duration: dto.duration,
        notes: dto.notes,
        leadId: dto.leadId,
        projectId:dto.ProjectId
      },
    });

    return {
      status: 201,
      message: 'Call created successfully',
      data: call,
    };
  }


async getCallsByLead(leadId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const calls = await this.prisma.call.findMany({
      where: { leadId },
      orderBy: { date: 'desc' },
    });

    return {
      status: 200,
      data: calls,
    };
  }












}
