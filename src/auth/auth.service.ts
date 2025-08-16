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
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

    try {
      // 🔍 تحقق من البريد
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new HttpException({
          statusCode: 409,
          error: 'Conflict',
          message: 'Account Already Exists',
          details: 'An account with this email address already exists. Please use a different email address or try logging in if this is your account.',
          suggestion: 'Use a different email or login with existing credentials'
        }, HttpStatus.CONFLICT);
      }

      // تحقق من صحة البريد الإلكتروني بشكل أكثر تفصيلاً
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid Email Format',
          details: 'The email address format is not valid. Please provide a valid email address.',
          suggestion: 'Use format like: user@example.com',
          field: 'email'
        });
      }

      if (userData.role === 'admin') {
        const existingAdmin = await this.prisma.user.findFirst({
          where: { role: 'admin' },
        });

        if (existingAdmin) {
          throw new BadRequestException('Only one admin is allowed in the system!');
        }
      }

      // 🔍 تحقق من الـ teamLeader لو المستخدم sales_rep
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

      // 📸 رفع الصورة لو موجودة
      let imageUrl: string | undefined;
      if (imageBase64) {
        try {
          imageUrl = await this.cloudinaryService.uploadImageFromBase64(imageBase64);
          console.log('✅ Image uploaded to Cloudinary:', imageUrl);
        } catch (imageError) {
          console.error('❌ Image upload failed:', imageError);
          throw new BadRequestException('Failed to upload image. Please try again with a valid image.');
        }
      } else {
        console.log('ℹ️ No image uploaded');
      }

      // 🔐 هاش كلمة السر
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: role as any,
          teamLeaderId: role === 'sales_rep' ? teamLeaderId : undefined,
          image: imageUrl,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          teamLeaderId: true,
          image: true,
          createdAt: true,
          // updatedAt: true,
          // مفيش password هنا
        },
      });

      return user;

      //  تسجيل اللوج
      await this.logsService.createLog({
        userId: user.id,
        action: 'register',
        description: `User ${user.email} registered successfully`,
        userName: user.name,
        userRole: user.role,
        ip: (userData as any).ip,
        userAgent: (userData as any).userAgent,
      });

      return user;

    } catch (error) {
      // Handle Prisma database constraint errors
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          const target = error.meta?.target as string[];
          if (target?.includes('email')) {
            throw new HttpException({
              statusCode: 409,
              error: 'Conflict',
              message: 'Email Already Registered',
              details: 'This email address is already registered in our system. Each email can only be used for one account.',
              suggestion: 'Please use a different email address or login if you already have an account',
              field: 'email'
            }, HttpStatus.CONFLICT);
          }
          throw new HttpException({
            statusCode: 409,
            error: 'Conflict',
            message: 'Duplicate Information',
            details: 'Some of the provided information conflicts with existing records.',
            suggestion: 'Please check your information and try again'
          }, HttpStatus.CONFLICT);
        }
        if (error.code === 'P2003') {
          // Foreign key constraint violation
          throw new BadRequestException('Invalid team leader reference. Please select a valid team leader.');
        }
        if (error.code === 'P2025') {
          // Record not found
          throw new BadRequestException('Referenced record not found. Please check your input data.');
        }
      }

      // Re-throw known application errors
      if (error instanceof HttpException || error instanceof BadRequestException) {
        throw error;
      }

      // Log unexpected errors for debugging
      console.error('❌ Unexpected error during user registration:', error);

      // Return generic error for unknown issues
      throw new HttpException(
        'Registration failed. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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
      throw new BadRequestException('Invalid password');
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
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
      ok: true,
    };
  }

  async GetUsers(role: string, userId?: string) {
    console.log('🔍 GetUsers called with role:', role, 'userId:', userId);

    const defaultSelect = {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    };

    let users;
    if (role === 'admin') {
      console.log(' Admin access - fetching all users');
      users = await this.prisma.user.findMany({
        include: {
          teamLeader: true
        },
      });
    } else if (role === 'sales_admin') {
      console.log(' Sales admin access - fetching sales users');
      users = await this.prisma.user.findMany({
        where: {
          role: {
            in: ['sales_rep', 'sales_admin', 'team_leader'],
          },
        },
        include: {
          teamLeader: true
        },
      });
    } else if (role === 'team_leader') {
      console.log(' Team leader access - fetching team members and self');
      if (!userId) {
        console.log(' Missing team leader ID');
        throw new ForbiddenException('Missing team leader ID');
      }

      users = await this.prisma.user.findMany({
        where: {
          OR: [
            { teamLeaderId: userId },
            { id: userId }
          ]
        },
        select: {
          ...defaultSelect,
          teamLeader: true,
        },
      });
      console.log(` Found ${users.length} users for team leader ${userId}`);
    } else {
      console.log(' Unauthorized role:', role);
      throw new ForbiddenException('Unauthorized');
    }

    // ✅ تحويل createdAt إلى string
    return users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
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
  async deleteUser(id: string, assignToId: string) {
    if (id === assignToId) {
      throw new BadRequestException('Cannot assign leads to the same user being deleted');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    const assignToUser = await this.prisma.user.findUnique({ where: { id: assignToId } });
    if (!assignToUser) throw new NotFoundException("Assigned user not found");

    await this.prisma.$transaction(async (tx) => {
      await tx.lead.updateMany({
        where: { ownerId: id },
        data: { ownerId: assignToId },
      });

      await tx.log.deleteMany({ where: { userId: id } });

      await tx.user.delete({ where: { id } });
    });

    return {
      status: 200,
      message: `User deleted and leads reassigned `,
    };
  }

  //Update User Data Just Admin
  async updateUser(id: string, data: UpdateUserDto, userId: string, currentRole: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException("User not found");
      }

      // Role-based restrictions
      if (currentRole !== 'admin' && currentRole !== 'sales_admin') {



        // Non-admin users can only update their own profile and cannot change role or teamLeaderId
        if (data.role !== undefined) {
          throw new ForbiddenException('You cannot change your role');
        }

        
        if (data.teamLeaderId !== undefined) {
          throw new ForbiddenException('You cannot change your team leader assignment');
        }
      }

      if (data.role === "admin") {
        throw new BadRequestException("You cannot create more than one admin in the system")
      }

      // Enhanced email validation
      if (data.email && data.email !== existingUser.email) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          throw new BadRequestException({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid Email Format',
            details: 'The email address format is not valid. Please provide a valid email address.',
            suggestion: 'Use format like: user@example.com',
            field: 'email'
          });
        }

        const emailExists = await this.prisma.user.findUnique({
          where: { email: data.email },
        });
        if (emailExists) {
          throw new HttpException({
            statusCode: 409,
            error: 'Conflict',
            message: 'Email Already In Use',
            details: 'This email address is already associated with another account. Please choose a different email address.',
            suggestion: 'Use a different email address for this account',
            field: 'email'
          }, HttpStatus.CONFLICT);
        }
      }

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      if (data.imageBase64) {
        try {
          const uploadedImage = await this.cloudinaryService.uploadImageFromBase64(data.imageBase64);
          data.image = uploadedImage;
        } catch (imageError) {
          console.error('❌ Image upload failed during user update:', imageError);
          throw new BadRequestException('Failed to upload image. Please try again with a valid image.');
        }
      }

      const { imageBase64, ...updateData } = data;

     
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

      // Log the profile update
      await this.logsService.createLog({
        userId: userId,
        email: existingUser.email,
        userRole: currentRole,
        action: 'update_user_profile',
        description: `User profile updated: id=${id}, updatedBy=${userId}, role=${currentRole}`,
      });

      return {
        status: 200,
        message: "User updated successfully",
        user: updatedUser,
      };

    } catch (error) {
      // Handle Prisma database constraint errors
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          const target = error.meta?.target as string[];
          if (target?.includes('email')) {
            throw new HttpException(
              'This email address is already in use by another account. Please use a different email.',
              HttpStatus.CONFLICT
            );
          }
          throw new HttpException(
            'A user with this information already exists.',
            HttpStatus.CONFLICT
          );
        }
        if (error.code === 'P2003') {
          // Foreign key constraint violation
          throw new BadRequestException('Invalid team leader reference. Please select a valid team leader.');
        }
        if (error.code === 'P2025') {
          // Record not found
          throw new NotFoundException('User not found.');
        }
      }

      // Re-throw known application errors
      if (error instanceof HttpException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException) {
        throw error;
      }

      // Log unexpected errors for debugging
      console.error('❌ Unexpected error during user update:', error);

      // Return generic error for unknown issues
      throw new HttpException(
        'User update failed. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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