import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Post("create")
  async createZone(@Body() dto: CreateZoneDto, @Req() req) {
    const {userId,  email, userRole } = req.user;
    return this.zonesService.createZone(dto, userId, email, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getAllZones(@Req() req) {
    const {  userId, email, role } = req.user;
    return this.zonesService.getAllZones(userId, email, role);
  }



  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Patch(':id')
  async updateZone(
    @Param('id') id: string,
    @Body() dto: UpdateZoneDto,
    @Req() req
  ) {
    const { userId, email,role } = req.user;
    return this.zonesService.updateZone(id, dto, userId, email, role);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteZone(@Param('id') id: string, @Req() req) {
    const {  userId, email, role } = req.user;
    return this.zonesService.deleteZone(id, userId, email, role);
  }
} 