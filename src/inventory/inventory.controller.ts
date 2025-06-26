import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dtos/create.inventory.dto';
import { UpdateInventoryDto } from './dtos/update.inventory';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Role } from 'src/auth/roles.enum';
import { Roles } from 'src/auth/Role.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ✅ إنشاء وحدة
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Post('create')
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.createInventory(dto);
  }

  // ✅ عرض كل الوحدات
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
  @Get('get-all')
  list() {
    return this.inventoryService.listInventory();
  }

  // ✅ تحديث وحدة
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateInventory(id, dto);
  }

  // ✅ حذف وحدة
  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.inventoryService.deleteInventory(id);
  }

  // ✅ فلترة
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
  @Get('filter')
  filter(@Query() query: any) {
    return this.inventoryService.filterInventory(query);
  }
}
