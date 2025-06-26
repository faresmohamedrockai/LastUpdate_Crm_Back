import { Controller, Post, Body, Get, UseGuards, Delete, Req, Patch,Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../DTOS/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.gaurd';
import { Roles } from './Role.decorator';
import { Role } from './roles.enum';
import { UpdateUserDto } from 'src/DTOS/update.user.dto';
import { LoginDto } from 'src/DTOS/login.dto';




@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    @Post("add-user")
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }


    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    @Delete('delete-user')
    async deleteUsere(@Body() user: { id: string }) {

        return this.authService.deleteUser(user.id)
    }
    // auth.controller.ts

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Roles(Role.ADMIN)
    @Patch('update-user')
    async updateUser(@Body() user: UpdateUserDto) {
        return this.authService.updateUser(user);
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



}
