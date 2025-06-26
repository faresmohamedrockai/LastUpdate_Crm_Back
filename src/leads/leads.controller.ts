import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Roles } from 'src/auth/Role.decorator';
import { Role } from 'src/auth/roles.enum';
import { UpdateLeadDto } from './dto/update.lead.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('leads')
export class LeadsController {



  constructor(private readonly leadsService: LeadsService) { }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
  @Post('create-lead')
  async addLead(@Body() dto: CreateLeadDto, @Req() req) {
    const userId = req.user.id;
    return this.leadsService.create(dto, userId);
  }




  @Get("find-leads")
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  async getLeads(@Req() req) {
    return this.leadsService.getLeads(req.user);
  }







  @Patch('update-lead/:id')
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  async updateLead(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @Req() req
  ) {
    return this.leadsService.updateLead(id, dto, req.user);
  }





}

