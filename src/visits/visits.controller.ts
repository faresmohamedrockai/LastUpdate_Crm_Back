// src/visit/visit.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visits.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Post()
  async createVisit(@Body() dto: CreateVisitDto, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.visitsService.createVisit(dto, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getAllVisits(@Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.visitsService.getAllVisits(userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get(':id')
  async getVisitById(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.visitsService.getVisitById(id, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Patch(':id')
  async updateVisit(
    @Param('id') id: string,
    @Body() dto: CreateVisitDto,
    @Req() req
  ) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.visitsService.updateVisit(id, dto, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Delete(':id')
  async deleteVisit(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.visitsService.deleteVisit(id, userId, userName, userRole);
  }
}
