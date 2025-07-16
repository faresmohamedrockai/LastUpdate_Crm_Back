import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dtos/create.inventory.dto';
import { UpdateInventoryDto } from './dtos/update.inventory';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';








@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Post()
  async createInventory(@Body() dto: CreateInventoryDto, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.inventoryService.createInventory(dto, userId, userName, userRole);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getAllInventories(@Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.inventoryService.getAllInventories(userId, userName, userRole);
  }






   




















  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Patch(':id')
  async updateInventory(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
    @Req() req
  ) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.inventoryService.updateInventory(id, dto, userId, userName, userRole);
  }





  
  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Delete(':id')
  async deleteInventory(@Param('id') id: string, @Req() req) {
    const { id: userId, name: userName, role: userRole } = req.user;
    return this.inventoryService.deleteInventory(id, userId, userName, userRole);
  }
}
