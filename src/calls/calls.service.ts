import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCallDto } from './dto/create-calls.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { EmailService } from '../email/email.service';
import { Task,Meeting,Call,User } from '../tasks/types';
@Injectable()
export class CallsService {
  constructor(
    private prisma: PrismaService, 
    private readonly logsService: LogsService,
    private emailService: EmailService,
  ) {}

async createCall(dto: CreateCallDto, userId: string, id: string, email: string, role: string) {
  const lead = await this.prisma.lead.findUnique({ 
    where: { id: dto.leadId },
    include: { owner: true }, // لجلب اسم صاحب الـ lead
  });
  if (!lead) throw new NotFoundException('Lead not found');

  if (dto.projectId && dto.projectId.trim()) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Project not found');
  }

  const call = await this.prisma.call.create({
    data: {
      date: dto.date,
      outcome: dto.outcome,
      followUpDate: dto.followUpDate || null,
      followUpTime: dto.followUpTime || null,
      duration: dto.duration,
      notes: dto.notes,
      leadId: dto.leadId,
      projectId: dto.projectId?.trim() || undefined,
      createdBy: userId,
    },
    include: {
      lead: true,
      createdByUser:true,
      Project: true,
    },
  });

  await this.logsService.createLog({
    userId,
    action: 'create_call',
    description: `User ${id} created Call`,
    email,
    userRole: role,
  });

  // جدولة reminder للـ follow-up
  if (dto.outcome === 'Follow Up Required' && dto.followUpDate && dto.followUpTime) {
   if (!call.createdByUser) {
  console.log(`Call ${call.id} has no creator.`);
  return;
}
const user = { id: call.createdByUser.id, name: call.createdByUser.name, email:call.createdByUser.email };
console.log(user);

    if (!call.leadId || !call.createdBy) {
  // this.logger.warn(`Cannot schedule follow-up reminder for call ${call.id} because leadId or createdBy is null`);
  return;
}
const userForReminder = {
  id: call.createdByUser.id,
  name: call.createdByUser.name || 'User',
  email: call.createdByUser.email,
  role: call.createdByUser.role || '', // لو ال role مطلوبة
  createdAt: call.createdByUser.createdAt,
  password: call.createdByUser.password || '', // لو الدالة محتاجة
};
    await this.emailService.scheduleCallFollowUpReminder(call as Call, userForReminder as any );
  }

  return {
    status: 201,
    message: 'Call created successfully',
    data: call,
  };
}


  async getAllCalls(leadId: string) {
  const calls = await this.prisma.call.findMany({
    where: { leadId },
    include: {
      lead: true,
      Project: true, 
      createdByUser: true, 
    },
    orderBy: { date: 'desc' },
  });

  return {
    status: 200,
    data: calls,
  };
}


  // async getCallById(id: string, userId: string, userName: string, userRole: string) {
  //   const call = await this.prisma.call.findUnique({
  //     where: { id },
  //     include: {
  //       lead: true,
  //       project: true,
  //     },
  //   });

  //   if (!call) {
  //     throw new NotFoundException('Call not found');
  //   }

  //   // Log call retrieval
  //   await this.logsService.createLog({
  //     userId,
  //     userName,
  //     userRole,
  //     action: 'get_call_by_id',
  //     leadId: call.leadId,
  //     description: `Retrieved call: id=${id}, lead=${call.lead.nameEn}, outcome=${call.outcome}`,
  //   });

  //   return {
  //     status: 200,
  //     data: call,
  //   };
  // }

  // async getCallsByLead(leadId: string, userId: string, userName: string, userRole: string) {
  //   const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
  //   if (!lead) throw new NotFoundException('Lead not found');

  //   const calls = await this.prisma.call.findMany({
  //     where: { leadId },
  //     include: {
  //       project: true,
  //     },
  //     orderBy: { date: 'desc' },
  //   });

  //   // Log calls retrieval by lead
  //   await this.logsService.createLog({
  //     userId,
  //     userName,
  //     userRole,
  //     action: 'get_calls_by_lead',
  //     leadId: leadId,
  //     description: `Retrieved ${calls.length} calls for lead: ${lead.nameEn}`,
  //   });

  //   return {
  //     status: 200,
  //     data: calls,
  //   };
  // }

  // async getCallsByProject(projectId: string, userId: string, userName: string, userRole: string) {
  //   const project = await this.prisma.project.findUnique({ where: { id: projectId } });
  //   if (!project) throw new NotFoundException('Project not found');

  //   const calls = await this.prisma.call.findMany({
  //     where: { projectId },
  //     include: {
  //       lead: true,
  //     },
  //     orderBy: { date: 'desc' },
  //   });

  //   // Log calls retrieval by project
  //   await this.logsService.createLog({
  //     userId,
  //     userName,
  //     userRole,
  //     action: 'get_calls_by_project',
  //     description: `Retrieved ${calls.length} calls for project: ${project.nameEn}`,
  //   });

  //   return {
  //     status: 200,
  //     data: calls,
  //   };
  // }

//   async updateCall(id: string, dto: CreateCallDto, userId: string, email: string, role: string) {
//     const existingCall = await this.prisma.call.findUnique({
//       where: { id },
//       include: {
//         lead: true,
//         Project: true,
//       },
//     });
//     if (!existingCall) throw new NotFoundException('Call not found');

//     // Validate project if provided
//     if (dto.project) {
//       const project = await this.prisma.project.findUnique({
//         where: { id: dto.project },
//       });
//       if (!project) {
//         throw new NotFoundException('Project not found');
//       }
//     }

//     const updatedCall = await this.prisma.call.update({
//       where: { id },
//       data: {
//         date: dto.date,
//         outcome: dto.outcome,
//         duration: dto.duration,
//         notes: dto.notes,
//         projectId: dto.project
//       },
//       include: {
//         lead: true,
//         Project: true,
//       },
//     });

//     // Log call update
//  await this.logsService.createLog({
//       userId: id,
//       action: 'create_call',
//       description: `User ${id} Updated Call in`,
   
//       email: email,
//       userRole: role,
//     });

//     return {
//       status: 200,
//       message: 'Call updated successfully',
//       data: updatedCall,
//     };
//   }

  async deleteCall(id: string, userId: string, email: string, role: string) {





    const existingCall = await this.prisma.call.findUnique({
      where: { id },
      include: {
        lead: true,
        Project: true,
      },
    });
    if (!existingCall) throw new NotFoundException('Call not found');


 await this.logsService.createLog({
      userId: userId || "none",
      action: 'create_call',
      description: `User ${userId} created Call in`,
   
      email: email,
      userRole: role,
    });


    await this.prisma.call.delete({ where: { id } });

    // Log call deletion
    // await this.logsService.createLog({
    //   userId,
    //   userName,
    //   userRole,
    //   action: 'delete_call',
    //   leadId: existingCall.leadId,
    //   description: `Deleted call: id=${id}, lead=${existingCall.lead.nameEn}, outcome=${existingCall.outcome}`,
    // });

    return {
      status: 200,
      message: 'Call deleted successfully',
    };
  }
}
