import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Request, HttpException, HttpStatus } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Post()
  async createMeeting(@Body() dto: CreateMeetingDto, @Req() req) {
const {  userId, email, role } = req.user;
    return this.meetingsService.createMeeting(dto, userId, email, role);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getAllMeetings(@Req() req) {
    const {  userId, email, role } = req.user;
    return this.meetingsService.getAllMeetings(userId, email, role);
  }

  

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get('project/:projectId')
  async getMeetingsByProject(
    @Param('projectId') projectId: string,
    @Req() req,
  ) {
    const { userId, email, role } = req.user;
    return this.meetingsService.getMeetingsByProject(projectId, userId, email, role);
  }








  

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Patch(':id')
  async updateMeeting(
    @Param('id') id: string,
    @Body() dto: UpdateMeetingDto,
    @Req() req
  ) {
   const {  userId, email, role } = req.user;

    return this.meetingsService.updateMeeting(id, dto, userId, email, role);
  }








  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Delete(':id')
  async deleteMeeting(@Param('id') id: string, @Req() req) {
   const {  userId, email, role } = req.user;
    return this.meetingsService.deleteMeeting(id, userId, email, role);
  }
} 