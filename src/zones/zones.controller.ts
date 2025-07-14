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
  @Post()
  async createZone(@Body() dto: CreateZoneDto, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.zonesService.createZone(dto, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getAllZones(@Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.zonesService.getAllZones(userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get('stats')
  async getZonesWithStats(@Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.zonesService.getZonesWithStats(userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get('city/:city')
  async getZonesByCity(@Param('city') city: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.zonesService.getZonesByCity(city, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get(':id')
  async getZoneById(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.zonesService.getZoneById(id, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Patch(':id')
  async updateZone(
    @Param('id') id: string,
    @Body() dto: UpdateZoneDto,
    @Req() req
  ) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.zonesService.updateZone(id, dto, userId, userName, userRole);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteZone(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.zonesService.deleteZone(id, userId, userName, userRole);
  }
} 