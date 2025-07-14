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
  @UseInterceptors(FileInterceptor('image'))
  register(
    @Body() body: RegisterDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.register(body, file);
  }




  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('delete-user/:id')
  async deleteUsere(@Param('id') id: string) {

    return this.authService.deleteUser(id)
  }
  // auth.controller.ts





  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN, Role.SALES_ADMIN)
  @Patch('update-user/:id')
  async updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.authService.updateUser(id, user);
  }









  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);

    // ✅ تخزين refresh_token في الكوكي
    res.cookie('refresh_token', result.tokens.refreshToken, {
      httpOnly: true,
      secure: true, // فعلها في production فقط
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
    });

    // ✅ إرسال access_token وباقي البيانات للفرونت
    return {
      access_token: result.tokens.access_token,
      user: result.user,
      message: result.message,
      status: result.status,
      ok: result.ok,
    };
  }















  @Get('refresh')
  async refreshToken(
    @Req() req: RequestWithCookies,
    @Res() res: Response
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new ForbiddenException('No refresh token provided');
    }

    const { access_token } = await this.authService.refreshToken(refreshToken);

   
    return res.json({ access_token });
  }













  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('user/:id')
  async getOneUser(@Param('id') id: string) {
    return this.authService.getOneUser(id);
  }



@Post('logout')
async logout(@Req() req: any, @Body() body: any, @Res({ passthrough: true }) res: Response) {
  const userId = body.userId;
  const userName = body.userName;
  const userRole = body.userRole;
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const userAgent = req.headers['user-agent'];

  if (userId) {
    await this.logsService.createLog({
      userId,
      action: 'logout',
      description: 'User logged out',
      ip,
      userAgent,
      userName,
      userRole,
    });
  }

  return { message: 'Logout successful' };
} }
