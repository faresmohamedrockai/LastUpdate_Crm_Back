import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    async create(
        createTransferDto: CreateTransferDto,
        userId: string,
        email: string,
        role: string
    ) {
        const { leadId, toAgentId } = createTransferDto;

        if (!leadId || !toAgentId) {
            throw new BadRequestException('leadId and toAgentId are required');
        }

        // هات الـ lead علشان نعرف المالك الحالي
        const lead = await this.prisma.lead.findUnique({
            where: { id: leadId },
            select: { id: true, ownerId: true },
        });

        if (!lead) throw new NotFoundException('Lead not found');

        // حدّد الـ fromAgent: لو جالك من الـ DTO استخدمه، وإلا استخدم المالك الحالي
        const fromAgentId = createTransferDto.fromAgentId ?? lead.ownerId ?? null;

        // ممنوع التحويل لنفس الشخص
        if (fromAgentId && fromAgentId === toAgentId) {
            throw new BadRequestException('Cannot transfer lead to the same agent.');
        }

        // اتأكد إن الـ toAgent موجود
        const toAgentExists = await this.prisma.user.findUnique({
            where: { id: toAgentId },
            select: { id: true },
        });
        if (!toAgentExists) throw new NotFoundException('Target agent not found');

        // نفّذ العملية في Transaction (إنشاء التحويل + تحديث مالك الـ lead)
        const leadTransfer = await this.prisma.$transaction(async (tx) => {
            const created = await tx.transferTable.create({
                data: {
                    leadId,
                    fromAgentId,
                    toAgentId,
                    transferType: createTransferDto.transferType,
                    notes: createTransferDto.notes,
                    // createdAt بيتتعبى تلقائيًا لو عندك @default(now())
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
                    fromAgent: { select: { id: true, name: true, email: true, role: true } },
                    toAgent: { select: { id: true, name: true, email: true, role: true } },
                },
            });

            await tx.lead.update({
                where: { id: leadId },
                data: { ownerId: toAgentId },
            });

            return created;
        });

        // // ممكن تسيب اللوج زي ما هو
        // await this.logsService.createLog({
        //     userId,
        //     email,
        //     userRole: role,
        //     action: 'create_transfer',
        //     description: `Transfer lead ${leadId} from ${fromAgentId ?? 'N/A'} to ${toAgentId}`,
        // });

        return {
            success: true,
            ...leadTransfer,
            createdAt: leadTransfer.createdAt.toISOString(),
        };
    }




    // 📌 Find All Transfers
    async findAll() {
        const leadTransfers = await this.prisma.transferTable.findMany({
            select: {
                id: true,
                leadId: true,
                fromAgentId: true,
                toAgentId: true,
                transferType: true, // حقل String عادي
                notes: true,
                createdAt: true,
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
            orderBy: { createdAt: 'desc' },
        });

        return leadTransfers.map((transfer) => ({
            ...transfer,
            createdAt: transfer.createdAt?.toISOString() ?? null,
        }));
    }



    async findLeadHistory(leadId: string) {
        if (!leadId?.trim()) {
            throw new BadRequestException("Lead ID is required");
        }

        try {
            const history = await this.prisma.transferTable.findMany({
                where: { leadId },
                select: {
                    id: true,
                    notes: true,
                    transferType: true, // حقل نوع التحويل
                    createdAt: true,
                    fromAgent: { select: { id: true, name: true, email: true, role: true } },
                    toAgent: { select: { id: true, name: true, email: true, role: true } },
                },
                orderBy: { createdAt: "desc" },
            });

            if (!history.length) {
                throw new NotFoundException(`No transfer history found for lead ID ${leadId}`);
            }

            return history.map((h) => ({
                id: h.id,
                from: h.fromAgent ?? null,
                to: h.toAgent ?? null,
                notes: h.notes,
                transferType: h.transferType ?? null,
                createdAt: h.createdAt?.toISOString() ?? null,
            }));
        } catch (error: any) {
            if (error.code === "P2023") {
                throw new BadRequestException("Invalid Lead ID format");
            }
            throw new InternalServerErrorException(
                "Something went wrong while fetching lead history",
            );
        }
    }







}
