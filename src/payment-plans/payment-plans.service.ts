import { Injectable, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-payment-plan.dto';

@Injectable()
export class PaymentPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) {}

  async createPaymentPlan(dto: CreatePaymentPlanDto, userId: string, userName: string, userRole: string) {
    try {
      // Check if payment plan already exists for this project
      const existingPaymentPlan = await this.prisma.paymentPlan.findFirst({
        where: { projectId: dto.projectId },
      });

      if (existingPaymentPlan) {
        throw new ConflictException('Payment plan already exists for this project');
      }

      const paymentPlan = await this.prisma.paymentPlan.create({
        data: {
          downpayment: dto.downPayment,
          installment: dto.installment,
          delivery: dto.delivery,
          schedule: dto.schedule,
          projectId: dto.projectId,
          installmentPeriod: dto.installmentPeriod,
          installmentEvery: dto.installmentEvery,
        },
        include: {
          project: {
            include: {
              inventories: {
                include: {
                  leads: true,
                  visits: true,
                },
              },
            },
          },
        },
      });

      await this.logsService.createLog({
        action: 'CREATE',
        userId,
        userName,
        userRole,
        description: `Created payment plan: downpayment=${paymentPlan.downpayment}, installment=${paymentPlan.installment}, delivery=${paymentPlan.delivery}`,
      });

      return paymentPlan;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException('Failed to create payment plan', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllPaymentPlans(userId: string, userName: string, userRole: string) {
    const paymentPlans = await this.prisma.paymentPlan.findMany({
      include: {
        project: {
          include: {
            inventories: true,
          },
        },
        inventories: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log payment plans retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_all_payment_plans',
      description: `Retrieved ${paymentPlans.length} payment plans`,
    });

    return paymentPlans;
  }

  async getPaymentPlanById(id: string, userId: string, userName: string, userRole: string) {
    const paymentPlan = await this.prisma.paymentPlan.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            inventories: {
              include: {
                leads: true,
                visits: true,
              },
            },
          },
        },
        inventories: {
          include: {
            leads: true,
            visits: true,
          },
        },
      },
    });

    if (!paymentPlan) {
      throw new NotFoundException('Payment plan not found');
    }

    // Log payment plan retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_payment_plan_by_id',
      description: `Retrieved payment plan: id=${id}, downpayment=${paymentPlan.downpayment}, installment=${paymentPlan.installment}`,
    });

    return paymentPlan;
  }

  async updatePaymentPlan(id: string, dto: UpdatePaymentPlanDto, userId: string, userName: string, userRole: string) {
    const existingPaymentPlan = await this.prisma.paymentPlan.findUnique({ where: { id } });
    if (!existingPaymentPlan) {
      throw new NotFoundException('Payment plan not found');
    }

    const updatedPaymentPlan = await this.prisma.paymentPlan.update({
      where: { id },
      data: {
        ...(dto.downPayment && { downpayment: dto.downPayment }),
        ...(dto.installment && { installment: dto.installment }),
        ...(dto.delivery && { delivery: dto.delivery }),
        ...(dto.schedule && { schedule: dto.schedule }),
      },
      include: {
        project: {
          include: {
            inventories: true,
          },
        },
        inventories: true,
      },
    });

    // Log payment plan update
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'update_payment_plan',
      description: `Updated payment plan: id=${id}, downpayment=${updatedPaymentPlan.downpayment}, installment=${updatedPaymentPlan.installment}`,
    });

    return {
      status: 200,
      message: 'Payment plan updated successfully',
      data: updatedPaymentPlan,
    };
  }

  async deletePaymentPlan(id: string, userId: string, userName: string, userRole: string) {
    const existingPaymentPlan = await this.prisma.paymentPlan.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            inventories: true,
          },
        },
        inventories: {
          include: {
            leads: true,
            visits: true,
          },
        },
      },
    });
    
    if (!existingPaymentPlan) {
      throw new NotFoundException('Payment plan not found');
    }

    // Check if payment plan has project with inventories or direct inventories
    const hasInventories = existingPaymentPlan.project?.inventories.length > 0 ||
                          existingPaymentPlan.inventories.length > 0;
    
    if (hasInventories) {
      throw new ConflictException('Cannot delete payment plan with existing project or inventories');
    }

    await this.prisma.paymentPlan.delete({ where: { id } });

    // Log payment plan deletion
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'delete_payment_plan',
      description: `Deleted payment plan: id=${id}`,
    });

    return {
      status: 200,
      message: 'Payment plan deleted successfully',
    };
  }

  async getPaymentPlansWithStats(userId: string, userName: string, userRole: string) {
    const paymentPlans = await this.prisma.paymentPlan.findMany({
      include: {
        project: {
          include: {
            inventories: {
              include: {
                leads: true,
                visits: true,
              },
            },
          },
        },
        inventories: {
          include: {
            leads: true,
            visits: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const paymentPlansWithStats = paymentPlans.map(paymentPlan => {
      const totalProjects = paymentPlan.project ? 1 : 0;
      const totalInventories = (paymentPlan.project?.inventories.length || 0) + paymentPlan.inventories.length;
      const totalLeads = (paymentPlan.project?.inventories.reduce((sum, inv) => sum + inv.leads.length, 0) || 0) +
                        paymentPlan.inventories.reduce((sum, inv) => sum + inv.leads.length, 0);
      const totalVisits = (paymentPlan.project?.inventories.reduce((sum, inv) => sum + inv.visits.length, 0) || 0) +
                         paymentPlan.inventories.reduce((sum, inv) => sum + inv.visits.length, 0);

      return {
        ...paymentPlan,
        stats: {
          totalProjects,
          totalInventories,
          totalLeads,
          totalVisits,
        },
      };
    });

    // Log payment plans stats retrieval
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_payment_plans_with_stats',
      description: `Retrieved ${paymentPlansWithStats.length} payment plans with statistics`,
    });

    return paymentPlansWithStats;
  }

  async getPaymentPlansByDuration(duration: string, userId: string, userName: string, userRole: string) {
  const allPaymentPlans = await this.prisma.paymentPlan.findMany({
  include: {
    project: {
      include: {
        inventories: {
          include: {
            leads: true,
            visits: true,
          },
        },
      },
    },
    inventories: {
      include: {
        leads: true,
        visits: true,
      },
    },
  },
  orderBy: { createdAt: 'desc' },
});

// فلترة النتائج حسب `duration` في الـ schedule (كـ string)
const filteredPlans = allPaymentPlans.filter(plan =>
  JSON.stringify(plan.schedule).includes(duration),
);

// Log payment plans retrieval by duration
await this.logsService.createLog({
  userId,
  userName,
  userRole,
  action: 'get_payment_plans_by_duration',
  description: `Retrieved ${filteredPlans.length} payment plans with duration: ${duration}`,
});




    // Log payment plans retrieval by duration
    await this.logsService.createLog({
      userId,
      userName,
      userRole,
      action: 'get_payment_plans_by_duration',
      description: `Retrieved ${filteredPlans.length} payment plans with duration: ${duration}`,
    });
return filteredPlans;
   
  }
} 