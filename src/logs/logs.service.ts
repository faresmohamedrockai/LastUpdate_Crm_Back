import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * إنشاء Log جديد
   */
  async createLog({
    userId,
    action,
    leadId,
    email,
    description,
    ip,
    userAgent,
    userName,
    userRole,
  }: CreateLogDto) {
    const logData: any = {
      // user: { connect: { id: userId } },
      userName,
      userRole,
      action,
      email,
      description: description || '',
    
    };
    if (leadId) {
      logData.leadId = leadId;
    }
    const log = await this.prisma.log.create({
      data: logData,
    });
  }

  /**
   * جلب كل الـ Logs
   */
  async getAllLogs() {
    return this.prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * جلب كل الـ Logs لمستخدم معين
   */
  async getLogsByUser(userId: string) {
    return this.prisma.log.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * جلب كل الـ Logs (لـ admin فقط)
   */
  async getLogsForAdmin() {
    return this.prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * جلب كل الـ Logs لكل أعضاء الشركة (sales_admin)
   * يحصل على كل اللوجات الخاصة بالـ team_leaders وأعضاء فرقهم
   */
  async getLogsForSalesAdmin() {
    // أولاً: هات كل الـ team_leaders
    const teamLeaders = await this.prisma.user.findMany({
      where: { role: 'team_leader' },
      select: { id: true },
    });
    const teamLeaderIds = teamLeaders.map(u => u.id);
    // هات كل أعضاء الفرق
    const teamMembers = await this.prisma.user.findMany({
      where: { teamLeaderId: { in: teamLeaderIds } },
      select: { id: true },
    });
    const memberIds = teamMembers.map(u => u.id);
    // كل اللوجات الخاصة بالـ team_leaders وأعضاء فرقهم
    return this.prisma.log.findMany({
      where: {
        OR: [
          { userId: { in: teamLeaderIds } },
          { userId: { in: memberIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * جلب كل الـ Logs لفريق معين (team_leader)
   * يحصل على كل اللوجات الخاصة به وبأعضاء فريقه فقط
   */
  async getLogsForTeamLeader(teamLeaderId: string) {
    // هات كل أعضاء الفريق
    const teamMembers = await this.prisma.user.findMany({
      where: { teamLeaderId },
      select: { id: true },
    });
    const memberIds = teamMembers.map(u => u.id);
    // كل اللوجات الخاصة بالـ team_leader وأعضاء فريقه
    return this.prisma.log.findMany({
      where: {
        OR: [
          { userId: teamLeaderId },
          { userId: { in: memberIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
} 