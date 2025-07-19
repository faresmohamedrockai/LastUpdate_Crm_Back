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
    const { role,userId } = req.user
    //     {
    //   userId: '14157eb6-2cea-4a27-a6ba-69d3080fa24c',
    //   email: 'fares@gmail.com',
    //   role: 'admin'
    // }
    return this.authService.GetUsers(role,userId);
  }







  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('delete-user/:id')
  async deleteUsere(@Param('id') id: string) {

    return this.authService.deleteUser(id)
  }






@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles(Role.ADMIN)
@Patch('update-user/:id')

async updateUser(
  @Param('id') id: string,

  @Body() data: UpdateUserDto
) {
  return this.authService.updateUser(id, data);
}









@Post("login")
async login(
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) res: Response,
  @Req() req: any
) {
  const UserData = await this.authService.login(dto);


  
  res.cookie('access_token', UserData.tokens.access_token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
   maxAge: 30 * 24 * 60 * 60 * 1000 // 30 يوم

  });


  // ✅ إرسال فقط access_token + بيانات المستخدم
  return {
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