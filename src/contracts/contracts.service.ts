import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) {}

  async createContract(dto: CreateContractDto, userId: string, userName: string, userRole: string) {
    // Validate lead exists
    const lead = await this.prisma.lead.findUnique({
      where: { id: dto.leadId },
    });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Validate inventory if provided
    if (dto.inventoryId) {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id: dto.inventoryId },
      });
      if (!inventory) {
        throw new NotFoundException('Inventory not found');
      }
    }

    // Validate project if provided
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const contract = await this.prisma.contract.create({
      data: {
        leadId: dto.leadId,
        inventoryId: dto.inventoryId,
        projectId: dto.projectId,
        dealValue: dto.dealValue,
        contractDate: new Date(dto.contractDate),
        status: dto.status,
        notes: dto.notes,
        createdById: userId,
      },
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
      },
    });

    // Log contract creation
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'create_contract',
      leadId: dto.leadId,
      description: `Created contract: lead=${lead.nameEn}, dealValue=${dto.dealValue}, status=${dto.status}, inventory=${contract.inventory?.title || 'none'}, project=${contract.project?.nameEn || 'none'}`,
    });

    return {
      status: 201,
      message: 'Contract created successfully',
      data: contract,
    };
  }

  async getAllContracts(userId: string, userName: string, userRole: string) {
    const contracts = await this.prisma.contract.findMany({
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log contracts retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_all_contracts',
      description: `Retrieved ${contracts.length} contracts`,
    });

    return contracts;
  }

  async getContractById(id: string, userId: string, userName: string, userRole: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Log contract retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_contract_by_id',
      leadId: contract.leadId,
      description: `Retrieved contract: id=${id}, lead=${contract.lead.nameEn}, dealValue=${contract.dealValue}`,
    });

    return contract;
  }

  async getContractsByLead(leadId: string, userId: string, userName: string, userRole: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const contracts = await this.prisma.contract.findMany({
      where: { leadId },
      include: {
        inventory: true,
        project: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log contracts retrieval by lead
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_contracts_by_lead',
      leadId: leadId,
      description: `Retrieved ${contracts.length} contracts for lead: ${lead.nameEn}`,
    });

    return contracts;
  }

  async updateContract(id: string, dto: UpdateContractDto, userId: string, userName: string, userRole: string) {
    const existingContract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        lead: true,
        inventory: true,
        project: true,
      },
    });
    if (!existingContract) {
      throw new NotFoundException('Contract not found');
    }

    // Validate inventory if provided
    if (dto.inventoryId) {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id: dto.inventoryId },
      });
      if (!inventory) {
        throw new NotFoundException('Inventory not found');
      }
    }

    // Validate project if provided
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: {
        ...(dto.inventoryId && { inventoryId: dto.inventoryId }),
        ...(dto.projectId && { projectId: dto.projectId }),
        ...(dto.dealValue && { dealValue: dto.dealValue }),
        ...(dto.contractDate && { contractDate: new Date(dto.contractDate) }),
        ...(dto.status && { status: dto.status }),
        ...(dto.notes && { notes: dto.notes }),
      },
      include: {
        lead: true,
        inventory: true,
        project: true,
        createdBy: true,
      },
    });

    // Log contract update
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'update_contract',
      leadId: existingContract.leadId,
      description: `Updated contract: id=${id}, lead=${existingContract.lead.nameEn}, dealValue=${dto.dealValue || existingContract.dealValue}, status=${dto.status || existingContract.status}`,
    });

    return {
      status: 200,
      message: 'Contract updated successfully',
      data: updatedContract,
    };
  }

  async deleteContract(id: string, userId: string, userName: string, userRole: string) {
    const existingContract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        lead: true,
        inventory: true,
        project: true,
      },
    });
    if (!existingContract) {
      throw new NotFoundException('Contract not found');
    }

    await this.prisma.contract.delete({ where: { id } });

    // Log contract deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_contract',
      leadId: existingContract.leadId,
      description: `Deleted contract: id=${id}, lead=${existingContract.lead.nameEn}, dealValue=${existingContract.dealValue}`,
    });

    return {
      status: 200,
      message: 'Contract deleted successfully',
    };
  }
} 