// src/visit/visit.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { VisitsService } from 'src/visits/visits.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/Role.decorator';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Role } from 'src/auth/roles.enum';
import { CreateVisitDto } from './dto/create-visits.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitService: VisitsService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Post('create')

  createVisit(@Body() dto: CreateVisitDto) {
    return this.visitService.createVisit(dto);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get('all')
  getAllVisits() {
    return this.visitService.getAllVisits();
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get(':id')
  getVisit(@Param('id') id: string) {
    return this.visitService.getVisitById(id);
  }
}
