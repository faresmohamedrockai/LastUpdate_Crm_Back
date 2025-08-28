import { Controller, Get, Headers, UseGuards, Req, Param } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.gaurd';
import { Roles } from '../auth/Role.decorator';
import { Role } from '../auth/roles.enum';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from './roles.gaurd';
// import { Roles } from './Role.decorator';
// import { Role } from './roles.enum';

// @UseGuards(AuthGuard("jwt"), RolesGuard)

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) { }







  // @UseGuards(AuthGuard("jwt"), RolesGuard)
  // @Roles(Role.ADMIN)
  // @Get('tip')
  // async getTip(@Headers('accept-language') lang: string, @Req() req: any) {

  //   const { role, userId, email } = req.user
  //   // console.log('🔍 Controller - req.user:', req.user);
  //   // console.log('🔍 Controller - extracted role:', role, 'userId:', userId);
  //   // lang = lang || 'en';


  //   const numver = Math.random() < 0.35
  //   console.log(numver);

  //   if (numver) {
  //     return this.aiService.getOrGenerateGeneralTip(lang, userId, email, role);
  //   } else {
  //     return this.aiService.getOrGenerateProactiveTip(lang, userId, email, role);
  //   }
  // }









  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get("tip-lead/:id")
  async getLeadTip(@Req() req: any, @Param('id') id: string,) {
    const { userId, email, role } = req.user;
    return this.aiService.getLeadTip(userId, id, email, role)

  }

  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
  @Get("tip-userLead")
  async getUserTip(@Req() req: any, @Param('id') id: string,) {
    const { userId, email, role } = req.user;
    return this.aiService.getUserTip(userId, email, role)

  }





}
