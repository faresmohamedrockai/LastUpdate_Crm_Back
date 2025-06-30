import { Injectable, NotFoundException, UnauthorizedException, HttpException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../DTOS/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from 'src/DTOS/update.user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }
async register(userData: RegisterDto) {
  const { email, password, role, name, teamLeaderId } = userData;

  const existingUser = await this.prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new HttpException('User already exists. Please login.', HttpStatus.CONFLICT);
  }

  if (role === 'sales_rep') {
    if (!teamLeaderId) {
      throw new HttpException('Team leader ID is required for sales representatives.', HttpStatus.BAD_REQUEST);
    }

    const teamLeader = await this.prisma.user.findUnique({
      where: { id: teamLeaderId },
    });

    if (!teamLeader || teamLeader.role !== 'team_leader') {
      throw new HttpException('Team leader not found or invalid role.', HttpStatus.BAD_REQUEST);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await this.prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: role as any,
      teamLeaderId: role === 'sales_rep' ? teamLeaderId : undefined,
    },
  });

  return user;
}


  async login(loginData: { email: string; password: string; role: string }) {
    const { email, password } = loginData;
    // 1. Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    // 2. Validate password
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    // 3. Generate Tokens
    const tokens = await this.generateTokens({
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    });
    // Save Refresh Token after hashing
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: { refreshToken: hashedRefreshToken },
    });
    // 4. Successful login
    return {

      tokens,
      message: 'Login successful',
      status: 200,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      },
      ok: true,
    };
  }


  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>("SECERT_JWT_REFRESH"),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new ForbiddenException('user not found');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new ForbiddenException('Invalid refresh token');
      }

      const access_token = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: this.configService.get<string>("SECERT_JWT_ACCESS"),
          expiresIn: '15m',
        }
      );

      return { access_token };
    } catch (error) {
      throw new ForbiddenException('Access Denied');
    }
  }


async getOneUser(id: string) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // 👇 هنا حدد النوع صراحةً
  let teamMembers: { id: string; name: string; email: string }[] = [];

  if (user.role === 'team_leader') {
    teamMembers = await this.prisma.user.findMany({
      where: { teamLeaderId: user.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  return {
    status: 200,
    message: 'User found',
    user: {
      ...user,
      teamMembers,
    },
  };
}
























  // For Delete User Just admin can do it
  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    await this.prisma.user.delete({ where: { id } });
    return {
      status: 200,
      message: "User deleted successfully"
    };
  }



  //Update User Data Just Admin
  //

 async updateUser(data: UpdateUserDto) {
  const { id, ...updateData } = data;

  const existingUser = await this.prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new NotFoundException("User not found");
  }

  // إذا فيه password محتاجة تتعمل لها hash
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedUser = await this.prisma.user.update({
    where: { id },
    data: updateData,
  });

  return {
    status: 200,
    message: "User updated successfully",
    user: updatedUser,
  };
}






  //This Function For generat access token and refresh token
  async generateTokens(userData: { id: string; email: string; role: string }) {
    const payload = {
      sub: userData.id,
      email: userData.email,
      role: userData.role,
    };
    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('SECERT_JWT_ACCESS'),
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('SECERT_JWT_REFRESH'),
      expiresIn: '30d',
    });
    return {
      access_token,
      refreshToken,
    };



  }




}