import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Roles } from 'src/auth/Role.decorator';
import { Role } from 'src/auth/roles.enum';
@Controller('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectsService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Post('create')
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.createProject(dto);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.updateProject(id, dto);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.projectService.deleteProject(id);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
  @Get('all')
  getAllProjects() {
    return this.projectService.getAllProjectsWithInventories();
  }




@Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
@Get('project/:id')
getProjectById(@Param('id') id: string) {
  return this.projectService.getProjectById(id);
}



}
