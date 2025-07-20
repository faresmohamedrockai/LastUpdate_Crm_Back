import { Injectable, NotFoundException, UnauthorizedException, HttpException, HttpStatus, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../DTOS/register.dto';
import * as bcrypt from 'bcrypt';
import * as sharp from "sharp"
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from 'src/DTOS/update.user.dto';
import { LogsService } from '../logs/logs.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // عدل المسار حسب مكان الملف
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly logsService: LogsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }






  async register(userData: RegisterDto) {
    const { email, password, role, name, teamLeaderId, imageBase64 } = userData;

    // 🔍 تحقق من البريد
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpException('User already exists. Please login.', HttpStatus.CONFLICT);
    }



    if (userData.role === 'admin') {
      const existingAdmin = await this.prisma.user.findFirst({
        where: { role: 'admin' },
      });

      if (existingAdmin) {
        throw new BadRequestException('Only one admin is allowed!');
      }
    }






    // 🔍 تحقق من الـ teamLeader لو المستخدم sales_rep
    if (role === 'SALES_REP') {
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

    // 📸 رفع الصورة لو موجودة
    let imageUrl: string | undefined;
    if (imageBase64) {
      imageUrl = await this.cloudinaryService.uploadImageFromBase64(imageBase64);
      console.log('✅ Image uploaded to Cloudinary:', imageUrl);
    } else {
      console.log(' No image uploaded');
    }

    // 🔐 هاش كلمة السر
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 إنشاء المستخدم
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as any,
        teamLeaderId: role === 'sales_rep' ? teamLeaderId : undefined,
        image: imageUrl,
      },
    });

    // 🧾 تسجيل اللوج
    await this.logsService.createLog({
      userId: user.id,
      action: 'register',
      description: `User ${user.email} registered`,
      userName: user.name,
      userRole: user.role,
      ip: (userData as any).ip,
      userAgent: (userData as any).userAgent,
    });

    return user;
  }















  async login(loginData: { email: string; password: string; role?: string; ip?: string; userAgent?: string }) {
    const { email, password, ip, userAgent } = loginData;
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






    // 4. Successful login
    await this.logsService.createLog({
      userId: existingUser.id,
      action: 'login',
      description: `User ${existingUser.email} logged in`,

      userName: existingUser.name,
      userRole: existingUser.role,
    });










    return {
      tokens,
      message: 'Login successful',
      status: 200,
      user: {
        id: existingUser.id,

        name: existingUser.name
        ,
        email: existingUser.email,
        role: existingUser.role,
      },
      ok: true,
    };
  }






  async GetUsers(role: string, userId?: string) {
    if (role === 'admin') {
      return this.prisma.user.findMany({});
    }

    if (role === 'sales_admin') {
      return this.prisma.user.findMany({
        where: {
          OR: [
            { role: 'sales_rep' },
            { role: 'team_leader' },
          ],
        },
      });
    }

    if (role === 'team_leader') {
      return this.prisma.user.findMany({
        where: {
          teamLeaderId: userId, // يجيب الفريق الخاص بالـ TL
        },
        include: {
          teamLeader: true, // ⬅️ هنا هنرجع بيانات الـ team leader لكل user
        },
      });
    }


    throw new ForbiddenException('Unauthorized');
  }








  async checkAuth(access_token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(access_token, {
        secret: this.configService.get<string>('SECERT_JWT_ACCESS') || 'default_secret',
      });
      if (payload) {
        return {
          user: {
            ok: true,
            status: 200,
            message: 'Valid token'
          }
        }
      }
      else {
        return {
          user: {
            ok: false,
            status: 401,
            message: 'Invalid or expired token',
          }

        };
      }
    } catch (error) {
      return {
        user: {
          ok: false,
          status: 401,
          message: 'Invalid or expired token',
        }

      };
    }
  }







  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>("SECERT_JWT_REFRESH"),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
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

    // حذف البيانات المرتبطة أولاً
    await this.prisma.$transaction(async (tx) => {
      // حذف الـ logs المرتبطة بالمستخدم
      await tx.log.deleteMany({ where: { userId: id } });

      // حذف الـ leads المرتبطة بالمستخدم
      await tx.lead.deleteMany({ where: { ownerId: id } });

      // حذف الـ calls المرتبطة بالمستخدم (لو كان هناك relation)
      // await tx.call.deleteMany({ where: { userId: id } });

      // حذف الـ visits المرتبطة بالمستخدم (لو كان هناك relation)
      // await tx.visit.deleteMany({ where: { userId: id } });

      // حذف المستخدم نفسه
      await tx.user.delete({ where: { id } });
    });

    return {
      status: 200,
      message: "User deleted successfully"
    };
  }



  //Update User Data Just Admin
  //

  async updateUser(id: string, data: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }



if(data.role === "admin"){
  throw new BadRequestException("You Can't Make Than More Than one Admin For System")
}



    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    if (data.imageBase64) {
      const uploadedImage = await this.cloudinaryService.uploadImageFromBase64(data.imageBase64);
      data.image = uploadedImage;
    }




    const { role, imageBase64, ...updateData } = data;

    // ✅ حذف المفاتيح الفارغة من البيانات
    Object.keys(updateData).forEach((key) => {
      if (
        updateData[key] === undefined ||
        updateData[key] === null ||
        (typeof updateData[key] === 'string' && updateData[key].trim() === '')
      ) {
        delete updateData[key];
      }
    });





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
      expiresIn: '30d',
    });

    return {
      access_token,

    };



  }




}