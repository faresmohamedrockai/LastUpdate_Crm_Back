import { Controller, Post, Body, Get, UseGuards, Delete, Req, Res, Patch, Param, UploadedFile, UseInterceptors, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../DTOS/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.gaurd';
import { Roles } from './Role.decorator';
import { Role } from './roles.enum';
import { UpdateUserDto } from 'src/DTOS/update.user.dto';
import { LoginDto } from 'src/DTOS/login.dto';
import { LogsService } from '../logs/logs.service';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express'; // ⬅️ أضف هذا

interface RequestWithCookies extends Request {
  cookies: {
    refresh_token?: string;
    [key: string]: any;
  };
}



@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private readonly logsService: LogsService,
  ) { }


  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN)
  @Post('add-user')

  register(
    @Body() body: RegisterDto,

  ) {
    return this.authService.register(body);
  }





  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
  @Get('users')


  GetUsrs(@Req() req: any) {
    const { role, userId } = req.user
    console.log('🔍 Controller - req.user:', req.user);
    console.log('🔍 Controller - extracted role:', role, 'userId:', userId);
 
    return this.authService.GetUsers(role, userId);
  }







 @Delete('delete-user/:id/leadsTo/:assignToId')
@Roles(Role.ADMIN) 
@UseGuards(AuthGuard('jwt'), RolesGuard) 
async deleteUser(
  @Param('id') id: string,
  @Param('assignToId') assignToId: string,
) {
  return this.authService.deleteUser(id, assignToId);
}







@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
@Patch('update-user/:id')

async updateUser(
  @Param('id') id: string,
@Req() req: any,
  @Body() data: UpdateUserDto
) {
  const {userId, role} = req.user;

  // Allow users to update their own profile, or admins to update any profile
  if (role !== Role.ADMIN && role !== Role.SALES_ADMIN && userId !== id) {
    throw new ForbiddenException('You can only update your own profile');
  }

  return this.authService.updateUser(id, data, userId, role);
}









@Post("login")
async login(
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) res: Response,
  @Req() req: any
) {
  const UserData = await this.authService.login(dto);


  
 


  // ✅ إرسال فقط access_token + بيانات المستخدم
  return {
  access_token:UserData.tokens.access_token,
    user: UserData.user,
    message: UserData.message,
    status: UserData.status,
    ok: true,
  };
}







// @Get('check')
// checkToken(@Req() req: any) {
//   const access_token = req.cookies?.access_token;
//   return this.authService.checkAuth(access_token)
    
// }








// @Post('refresh')
// async refreshToken(
//   @Req() req: RequestWithCookies,
//   @Res() res: Response
// ) {
  
 
//   const refreshToken = req.cookies?.refresh_token;
//   if (!refreshToken) {
//     throw new ForbiddenException('No refresh token provided');
//   }

//   const { access_token } = await this.authService.refreshToken(refreshToken);

// res.cookie('access_token',access_token , {
//   httpOnly: true,
//   secure: true,
//   maxAge: 1500000, // 1 ساعة
// });

//   return res.json({ access_token });
// }













@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles(Role.ADMIN, Role.SALES_ADMIN)
@Get('user/:id')
async getOneUser(@Param('id') id: string) {
  return this.authService.getOneUser(id);
}








@Post('logout')
async logout(@Req() req: any, @Body() body: any, @Res({ passthrough: true }) res: Response) {
  const userId = body.userId;
  const userName = body.userName;
  const userRole = body.userRole;



  if (req.cookies) {
    Object.keys(req.cookies).forEach(cookieName => {
      res.clearCookie(cookieName);
    });
  }





  if (userId) {
    await this.logsService.createLog({
      userId,
      action: 'logout',
      description: 'User logged out',

      userName,
      userRole,
    });
  }

  return { message: 'Logout successful' };
}
}