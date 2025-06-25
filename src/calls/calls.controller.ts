import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CallsService } from './calls.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Roles } from 'src/auth/Role.decorator';
import { Role } from 'src/auth/roles.enum';
import { CreateCallDto } from './dto/create-calls.dto';
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}




  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
  @Post('create')
  create(@Body() dto: CreateCallDto) {
    return this.callsService.createCall(dto);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
  @Get('lead/:leadId')
  getByLead(@Param('leadId') leadId: string) {
    return this.callsService.getCallsByLead(leadId);
  }












}
