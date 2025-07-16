import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Post("create")
  async createDeveloper(@Body() dto: CreateDeveloperDto, @Req() req) {
    const {  userId,  email, userRole } = req.user;
 
    //     {
    //   userId: '14157eb6-2cea-4a27-a6ba-69d3080fa24c',
    //   email: 'fares@gmail.com',
    //   role: 'admin'
    // }
    return this.developersService.createDeveloper(dto, userId, email, userRole);
  }










  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getAllDevelopers(@Req() req) {
    const { userId, email, role } = req.user;
   
    
    return this.developersService.findAll();
  }





  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get('stats')
  async getDevelopersWithStats(@Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.developersService.getDevelopersWithStats(userId, userName, userRole);
  }










  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get(':id')
  async getDeveloperById(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.developersService.getDeveloperById(id, userId, userName, userRole);
  }







  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Patch(':id')
  async updateDeveloper(
    @Param('id') id: string,
    @Body() dto: UpdateDeveloperDto,
    @Req() req
  ) {
    const { userId, email,  userRole } = req.user;
    return this.developersService.updateDeveloper(id, dto, userId, email, userRole);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteDeveloper(@Param('id') id: string, @Req() req) {
    const {  userId, email,  userRole } = req.user;
    return this.developersService.deleteDeveloper(id, userId, email, userRole);
  }
} 