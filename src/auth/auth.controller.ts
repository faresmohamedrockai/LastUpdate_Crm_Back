import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../DTOS/register.dto';
import { AuthGuard } from '@nestjs/passport';




@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }
    @UseGuards(AuthGuard("jwt"))
    @Post("register")
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }



    @Post("login")
    async login(@Body() dto: RegisterDto) {
        return this.authService.login(dto);
    }



    @Get('refresh')
    async refreshToken(@Body("refreshToken") refreshToken: string) {
        return this.authService.refreshToken(refreshToken)

    }





}
