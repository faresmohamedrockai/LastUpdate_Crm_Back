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
    const {   email,  role } = req.user;
    return this.projectsService.createProject(dto, email, role);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getAllProjects(@Req() req) {
    const { } = req.user;
    return this.projectsService.getAllProjects();
  }




  

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req
  ) {
    const {  userId, email, role } = req.user;
    return this.projectsService.updateProject(id, dto, userId, email, role);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.projectsService.deleteProject(id, userId, userName, userRole);
  }
}
