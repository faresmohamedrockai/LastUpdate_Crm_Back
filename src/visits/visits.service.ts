import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visits.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VisitsService {
     constructor(private prisma: PrismaService) {}

  async createVisit(dto: CreateVisitDto) {
    const visit = await this.prisma.visit.create({
      data: {
        date: new Date(dto.date),
        status: dto.status,
        notes: dto.notes,
        lead: { connect: { id: dto.leadId } },
        inventory: { connect: { id: dto.inventoryId } },
      },
    });

    return {
      status: 201,
      message: 'Visit created successfully',
      data: visit,
    };
  }

  async getAllVisits() {
    return await this.prisma.visit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lead: true,
        inventory: true,
      },
    });
  }

  async getVisitById(id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        lead: true,
        inventory: true,
      },
    });
    if (!visit) throw new NotFoundException('Visit not found');

    return visit;
  }
}
