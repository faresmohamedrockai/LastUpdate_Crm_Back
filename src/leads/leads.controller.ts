import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update.lead.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Post("create")
async createLead(@Body() dto: CreateLeadDto, @Req() req) {
  const { id, email, role } = req.user;

  if (!id) {
    throw new BadRequestException('User ID not found in request');
  }

  return this.leadsService.create(dto, id, email, role);
}





  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getLeads(@Req() req) {
    const { id, email, role } = req.user;

    return this.leadsService.getLeads(id, email, role);
  }





  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get(':id')
  async getLeadById(@Param('id') id: string, @Req() req) {
    const { id: userId, email, role } = req.user;
    return this.leadsService.getLeadById(id, { id: userId, role: role });
  }





  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Patch(':id')
  async updateLead(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @Req() req
  ) {
    const { id: userId, email, role } = req.user;
    return this.leadsService.updateLead(id, dto, { id: userId, role: role }, email, role);
  }





  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Delete(':id')
  async deleteLead(@Param('id') id: string, @Req() req) {
    const { id: userId, email, role } = req.user;
    return this.leadsService.deleteLead(id, userId, email, role);
  }

  
}

