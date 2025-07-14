import { Injectable, NotFoundException, UnauthorizedException, HttpException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../DTOS/register.dto';
import * as bcrypt from 'bcrypt';
import * as sharp from "sharp"
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from 'src/DTOS/update.user.dto';
import { LogsService } from '../logs/logs.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // عدل المسار حسب مكان الملف
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly logsService: LogsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }






  async register(userData: RegisterDto, file?: Express.Multer.File) {
    const { email, password, role, name, teamLeaderId } = userData;

    // 🔍 تحقق من البريد
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpException('User already exists. Please login.', HttpStatus.CONFLICT);
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

    // 📸 ضغط الصورة ورفعها لـ Cloudinary
    let imageUrl: string | undefined;
    if (file) {
      console.log('✅ Received file:', file.originalname);

      const compressedBuffer = await sharp(file.buffer)
        .resize({ width: 300 }) // Resize اختياري
        .jpeg({ quality: 70 })  // ضغط الجودة
        .toBuffer();

      imageUrl = await this.cloudinaryService.uploadBuffer(compressedBuffer, 'users');

      console.log('✅ Image uploaded to Cloudinary:', imageUrl);
    } else {
      console.log('⚠️ No image uploaded');
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
        teamLeaderId: role === 'SALES_REP' ? teamLeaderId : undefined,
        image: imageUrl,
      },
    });

    // 🧾 تسجيل العملية في اللوج
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
      ip,
      userAgent,
      userName: existingUser.name,
      userRole: existingUser.role,
    });

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

    // التحقق من أن الـ email الجديد غير مستخدم من قبل مستخدم آخر
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
    }









    // إذا فيه password محتاجة تتعمل لها hash
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const { role, ...updateData } = data;

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
      expiresIn: '15d',
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