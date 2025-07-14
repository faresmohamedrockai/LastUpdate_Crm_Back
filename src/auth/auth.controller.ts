import { Controller, Post, Body, Get, UseGuards, Delete, Req, Patch,Param,UploadedFile,UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../DTOS/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.gaurd';
import { Roles } from './Role.decorator';
import { Role } from './roles.enum';
import { UpdateUserDto } from 'src/DTOS/update.user.dto';
import { LoginDto } from 'src/DTOS/login.dto';
import { LogsService } from '../logs/logs.service';

import { FileInterceptor } from '@nestjs/platform-express';

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
    @Roles(Role.ADMIN,Role.SALES_ADMIN)
    @Patch('update-user/:id')
    async updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
        return this.authService.updateUser(id, user);
    }








    @Post("login")
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }



    @Get('refresh')
    async refreshToken(@Body("refreshToken") refreshToken: string) {
        return this.authService.refreshToken(refreshToken)

    }



@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles(Role.ADMIN)
@Get('user/:id')
async getOneUser(@Param('id') id: string) {
  return this.authService.getOneUser(id);
}

@Post('logout')
async logout(@Req() req) {
  const userId = req.user.id;
  const userName = req.user.name;
  const userRole = req.user.role;
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const userAgent = req.headers['user-agent'];
  await this.logsService.createLog({
    userId,
    action: 'logout',
    description: 'User logged out',
    ip,
    userAgent,
    userName,
    userRole,
  });
  return { message: 'Logout successful' };
}

}
