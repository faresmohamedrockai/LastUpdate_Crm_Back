import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PaymentPlansService } from './payment-plans.service';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-payment-plan.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('payment-plans')
export class PaymentPlansController {
  constructor(private readonly paymentPlansService: PaymentPlansService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Post()
  async createPaymentPlan(@Body() dto: CreatePaymentPlanDto, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.paymentPlansService.createPaymentPlan(dto, userId, userName, userRole);
  }







  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getAllPaymentPlans(@Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.paymentPlansService.getAllPaymentPlans(userId, userName, userRole);
  }







  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get('stats')
  async getPaymentPlansWithStats(@Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.paymentPlansService.getPaymentPlansWithStats(userId, userName, userRole);
  }






  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get('duration/:duration')
  async getPaymentPlansByDuration(@Param('duration') duration: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.paymentPlansService.getPaymentPlansByDuration(duration, userId, userName, userRole);
  }







  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get(':id')
  async getPaymentPlanById(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.paymentPlansService.getPaymentPlanById(id, userId, userName, userRole);
  }






  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Patch(':id')
  async updatePaymentPlan(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentPlanDto,
    @Req() req
  ) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.paymentPlansService.updatePaymentPlan(id, dto, userId, userName, userRole);
  }




  
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deletePaymentPlan(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.paymentPlansService.deletePaymentPlan(id, userId, userName, userRole);
  }
} 