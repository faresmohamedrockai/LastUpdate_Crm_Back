import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dtos/create.inventory.dto';
import { UpdateInventoryDto } from './dtos/update.inventory';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Role } from 'src/auth/roles.enum';
import { Roles } from 'src/auth/Role.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
  @Post('create')
  @UseInterceptors(FilesInterceptor('images'))
  create(
    @Body() dto: CreateInventoryDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.inventoryService.createInventory(dto, files);
  }
@Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
  @Get('get-all')
  list() {
    return this.inventoryService.listInventory();
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
  @Patch('update/:id')
  @UseInterceptors(FilesInterceptor('images'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.inventoryService.updateInventory(id, dto, files);
  }

  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.inventoryService.deleteInventory(id);
  }

 @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.SALES_REP, Role.TEAM_LEADER)
@Get('filter')
filter(@Query() query: any) {

  return this.inventoryService.filterInventory(query);
}







}
