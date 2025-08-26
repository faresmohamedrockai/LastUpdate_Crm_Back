import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { LeadsService } from 'src/leads/leads.service';
// import { Role } from '@prisma/client';
import { Role } from '../auth/roles.enum';
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class TransferService {
    constructor(
        private prisma: PrismaService,
        private leadService: LeadsService,
        private UserService: AuthService
    ) { }

    // 📌 Create Transfer
    async create(createTransferDto: CreateTransferDto,userId:string,email:string,role:string) {
        const leadTransfer = await this.prisma.transferTable.create({
            data: {
                leadId: createTransferDto.leadId,
                fromAgentId: createTransferDto.fromAgentId ?? undefined,
                toAgentId: createTransferDto.toAgentId ?? undefined,
                transferType: createTransferDto.transferType ?? undefined,
                notes: createTransferDto.notes ?? undefined,
                createdAt: new Date(), // ISO Date
            },
            include: {
                lead: {
                    select: {
                        id: true,
                        nameAr: true,
                        nameEn: true,
                        status: true,
                        contact: true,
                        interest: true,
                        tier: true,
                        cil: true,
                        description: true,
                    },
                },
                fromAgent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                toAgent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });


        const TransferLead = await this.leadService.updateLead(createTransferDto.leadId,{assignedToId:createTransferDto.toAgentId},{id:userId, role: role as Role },email,role)







        return {
            ...leadTransfer,
            createdAt: leadTransfer.createdAt
                ? leadTransfer.createdAt.toISOString()
                : null,
        };
    }


    // 📌 Find All Transfers
    async findAll() {
        const leadTransfers = await this.prisma.transferTable.findMany({
            include: {
                lead: {
                    select: {
                        id: true,
                        nameAr: true,
                        nameEn: true,
                        status: true,
                        contact: true,
                        interest: true,
                        tier: true,
                        cil: true,
                        description: true,
                    },
                },
                fromAgent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                toAgent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' }, // عشان يجيب الأحدث الأول
        });

        // لازم أعمل map عشان أضيف createdAt بصيغة ISO
        return leadTransfers.map((transfer) => ({
            ...transfer,
            createdAt: transfer.createdAt
                ? transfer.createdAt.toISOString()
                : null,
        }));
    }


}
