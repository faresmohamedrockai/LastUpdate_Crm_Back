import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';
import { CreateLogDto } from './dto/create-log.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  // إنشاء Log جديد
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Post()
  async createLog(@Body() body: CreateLogDto, @Req() req) {
    // لو لم يتم إرسال userId أو userName أو userRole من الـ frontend، خذهم من الـ JWT
    const userId = body.userId || req.user.id;
    const userName = body.userName || req.user.name;
    const userRole = body.userRole || req.user.role;
    const ip = body.ip || req.ip;
    const userAgent = body.userAgent || req.headers['user-agent'];
    return this.logsService.createLog({
      ...body,
      userId,
      userName,
      userRole,
      ip,
      userAgent,
    });
  }

  // جلب كل الـ Logs أو حسب userId
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get()
  async getLogs(@Req() req, @Query('userId') userId?: string) {
    const { id, role } = req.user;
    if (role === Role.ADMIN) {
      return this.logsService.getLogsForAdmin();
    }
    if (role === Role.SALES_ADMIN) {
      return this.logsService.getLogsForSalesAdmin();
    }
    if (role === Role.TEAM_LEADER) {
      return this.logsService.getLogsForTeamLeader(id);
    }
    // SALES_REP or default: only their own logs
    return this.logsService.getLogsByUser(id);
  }
} 