import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) { }

  async createContract(
    dto: CreateContractDto,
    userId: string,
    email: string,
    role: string,
  ) {
    // تحقق من وجود الـ Inventory (اختياري)
    if (dto.inventoryId) {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id: dto.inventoryId },
      });
      if (!inventory) throw new NotFoundException('Inventory not found');
    }

    // تحقق من وجود الـ Lead (اختياري)
    if (dto.leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: dto.leadId },
      });
      if (!lead) throw new NotFoundException('Lead not found');
    }

    // 🔹 جلب آخر cNumber موجود
    const lastContract = await this.prisma.contract.findFirst({
      orderBy: { createdAt: 'desc' }, // أو orderBy: { cNumber: 'desc' } لو فيه index
      select: { cNumber: true },
    });

    let nextNumber = 1;
    if (lastContract?.cNumber) {
      // إزالة الـ "C-" وتحويله لرقم
      const lastNumber = parseInt(lastContract.cNumber.replace('C-', ''), 10);
      nextNumber = lastNumber + 1;
    }

    const cNumber = `C-${nextNumber}`;

    const contract = await this.prisma.contract.create({
      data: {
        leadId: dto.leadId,
        inventoryId: dto.inventoryId,
        dealValue: dto.dealValue,
        contractDate: dto.contractDate,
        status: dto.status,
        notes: dto.notes,
        createdById: userId,
        cNumber, // الرقم المتسلسل
      },
      include: {
        lead: true,
        inventory: true,
        createdBy: true,
      },
    });

    // Log
    await this.logsService.createLog({
      userId,
      email,
      userRole: role,
      action: 'create_contract',
      description: `Created contract: cNumber=${cNumber}, dealValue=${contract.dealValue}, status=${contract.status}`,
    });

    return {
      status: 201,
      message: 'Contract created successfully',
      data: contract,
    };
  }







  async getAllContracts(userId: string, email: string, role) {
    const contracts = await this.prisma.contract.findMany({
      include: {
        lead: true,
        inventory: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    await this.logsService.createLog({
      userId,
      email,
      userRole: role,
      action: 'get_all_contracts',
      description: `Retrieved ${contracts.length} contracts`,
    });

    return {
      status: 200,
      message: 'Contracts retrieved successfully',
      count: contracts.length,
      data: contracts,
    };
  }

  async updateContract(
    id: string,
    dto: UpdateContractDto,
    userId: string,
    email: string,
    role: string,
  ) {
    const existingContract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        lead: true,
        inventory: true,
      },
    });
    if (!existingContract) {
      throw new NotFoundException('Contract not found');
    }

    if (dto.inventoryId) {
      const inventory = await this.prisma.inventory.findUnique({
        where: { id: dto.inventoryId },
      });
      if (!inventory) throw new NotFoundException('Inventory not found');
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: {
        ...(dto.leadId !== undefined && { leadId: dto.leadId }),
        ...(dto.inventoryId !== undefined && { inventoryId: dto.inventoryId }),
        ...(dto.dealValue !== undefined && { dealValue: dto.dealValue }),
        ...(dto.contractDate !== undefined && { contractDate: dto.contractDate }), // بدون new Date
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        lead: true,
        inventory: true,
        createdBy: true,
      },
    });


    await this.logsService.createLog({
      userId,
      email,
      userRole: role,
      action: 'Update Contratc',
      description: `Update contracts`,
    });




    return {
      status: 200,
      message: 'Contract updated successfully',
      data: updatedContract,
    };
  }

  async deleteContract(
    id: string,
    userId: string,
    email: string,
    role: string,
  ) {
    const existingContract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        lead: true,
        inventory: true,
      },
    });

    if (!existingContract) {
      throw new NotFoundException('Contract not found');
    }



    await this.logsService.createLog({
      userId,
      email,
      userRole: role,
      action: 'delete_contract',

      description: `Deleted contract: id=${id}, dealValue=${existingContract.dealValue}`,
    });






    await this.prisma.contract.delete({ where: { id } });


    return {
      status: 200,
      message: 'Contract deleted successfully',
    };
  }
}
