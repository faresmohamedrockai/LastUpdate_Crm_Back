import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}




  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Post()
  async createContract(@Body() dto: CreateContractDto, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.contractsService.createContract(dto, userId, userName, userRole);
  }









  
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getAllContracts(@Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.contractsService.getAllContracts(userId, userName, userRole);
  }

  // @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  // @Get(':id')
  // async getContractById(@Param('id') id: string, @Req() req) {
  //   const { id: userId, name: userName, role: userRole } = req.user;
  //   return this.contractsService.getContractById(id, userId, userName, userRole);
  // }

  // @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  // @Get('lead/:leadId')
  // async getContractsByLead(@Param('leadId') leadId: string, @Req() req) {
  //   const { id: userId, name: userName, role: userRole } = req.user;
  //   return this.contractsService.getContractsByLead(leadId, userId, userName, userRole);
  // }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Patch(':id')
  async updateContract(
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
    @Req() req
  ) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.contractsService.updateContract(id, dto, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Delete(':id')
  async deleteContract(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.contractsService.deleteContract(id, userId, userName, userRole);
  }
} 