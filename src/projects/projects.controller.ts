import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Post()
  async createProject(@Body() dto: CreateProjectDto, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.projectsService.createProject(dto, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getAllProjects(@Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.projectsService.getAllProjects(userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get('developer/:developerId')
  async getProjectsByDeveloper(@Param('developerId') developerId: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.projectsService.getProjectsByDeveloper(developerId, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get('zone/:zoneId')
  async getProjectsByZone(@Param('zoneId') zoneId: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.projectsService.getProjectsByZone(zoneId, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get(':id')
  async getProjectById(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.projectsService.getProjectById(id, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req
  ) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.projectsService.updateProject(id, dto, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.projectsService.deleteProject(id, userId, userName, userRole);
  }
}
