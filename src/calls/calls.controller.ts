import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-calls.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}









  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Post("create/:id")
  async createCall(@Body() dto: CreateCallDto, @Req() req) {
    const {id}=req.params
    const {  userId, email, role } = req.user;
    return this.callsService.createCall(dto,userId,id,email,role );
  }

















  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
@Get(":id")
async getAllCalls(@Param('id') id: string, @Req() req) {
  const { userId, email, role } = req.user;
  return this.callsService.getAllCalls(id); // ✅ فقط leadId
}










  // @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  // @Get('lead/:leadId')
  // async getCallsByLead(@Param('leadId') leadId: string, @Req() req) {
  //   const { id: userId, name: userName, role: userRole } = req.user;
  //   return this.callsService.getCallsByLead(leadId, userId, userName, userRole);
  // }







  




  // @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  // @Get('project/:projectId')
  // async getCallsByProject(@Param('projectId') projectId: string, @Req() req) {
  //   const { id: userId, name: userName, role: userRole } = req.user;
  //   return this.callsService.getCallsByProject(projectId, userId, userName, userRole);
  // }








 







  // @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  // @Patch(':id')
  // async updateCall(
  //   @Param('id') id: string,
  //   @Body() dto: CreateCallDto,
  //   @Req() req
  // ) {
  //   const { id: userId, name: userName, role: userRole } = req.user;
  //   return this.callsService.updateCall(id, dto, userId, userName, userRole);
  // }





  
  // @Roles(Role.ADMIN, Role.SALES_ADMIN)
  // @Delete(':id')
  // async deleteCall(@Param('id') id: string, @Req() req) {
  //   const { id: userId, name: userName, role: userRole } = req.user;
  //   return this.callsService.deleteCall(id, userId, userName, userRole);
  // }





}
