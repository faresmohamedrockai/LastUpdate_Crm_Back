import { Body, Controller, Get, Post, UseGuards,Req } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';

@Controller('transfer')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  async create(@Body() createTransferDto: CreateTransferDto,@Req() req: any) {
 const { role, email,userId } = req.user
    console.log('🔍 Controller - req.user:', req.user);
    console.log('🔍 Controller - extracted role:', role, 'userId:', userId);
 


    return this.transferService.create(createTransferDto,userId,email,role);
  }





  @Get()
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  async findAll() {

    return this.transferService.findAll();
  }
}
