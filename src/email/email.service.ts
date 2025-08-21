import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as dayjs from 'dayjs';
import { User } from '@prisma/client';
import { Task, Meeting, Call } from '../tasks/types';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService,

    private schedulerRegistry: SchedulerRegistry
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('GMAIL_HOST', 'smtp.gmail.com'),
      port: Number(this.configService.get('GMAIL_PORT', 587)), // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }


  // Reminders

  private generateMeetingReminderEmail(meeting: Meeting, user: User): string {
    const meetingDate = meeting.date
      ? new Date(meeting.date).toLocaleDateString()
      : 'No date set';
    const meetingTime = meeting.time || 'No time set';
    const location = meeting.location || 'Not specified';
    const duration = meeting.duration || 'Not specified';

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Meeting Reminder</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #cfe2ff; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
      .meeting-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
      .btn { display: inline-block; padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 5px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/dxkau0eb3/image/upload/v1755677291/propiaImage_iwm9j8.jpg" 
             alt="Meeting Banner" 
             style="max-width: 100%; border-radius: 5px;"/>
        <h2>⏰ Meeting Reminder</h2>
        <p>Hello ${user.name},</p>
        <p>This is a reminder for your upcoming meeting.</p>
      </div>
      
      <div class="meeting-details">
        <h3>${meeting.title || 'Meeting'}</h3>
        <p><strong>Client:</strong> ${meeting.client || 'Not specified'}</p>
        <p><strong>Date:</strong> ${meetingDate}</p>
        <p><strong>Time:</strong> ${meetingTime}</p>
        <p><strong>Duration:</strong> ${duration}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Notes:</strong> ${meeting.notes || 'No additional notes'}</p>
        <p><strong>Status:</strong> ${meeting.status || 'Scheduled'}</p>
      </div>

      <p style="margin-top: 20px;">
        <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/meetings" class="btn">
          View Meeting Details
        </a>
      </p>

      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        This is an automated notification from your CRM system.
      </p>
    </div>
  </body>
  </html>
  `;
  }

  private generateTaskReminderEmail(task: Task, user: User): string {
    const dueDate = new Date(task.dueDate).toLocaleDateString();
    const priorityColor = this.getPriorityColor(task.priority);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Task Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .task-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
          .priority { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
          .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 Task Reminder</h2>
            <p>Hello ${user.name},</p>
            <p>This is a reminder for a task that's due soon.</p>
          </div>
          
          <div class="task-details">
            <h3>${task.title}</h3>
            <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p><strong>Priority:</strong> <span class="priority" style="background: ${priorityColor}">${task.priority}</span></p>
            <p><strong>Type:</strong> ${task.type.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Status:</strong> ${task.status.replace('_', ' ').toUpperCase()}</p>
          </div>
          
          <p style="margin-top: 20px;">
            <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/tasks/${task.id}" class="btn">
              View Task Details
            </a>
          </p>
          
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            This is an automated reminder from your CRM system.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private generateMeetingConfirmationEmail(meeting: Meeting, user: User): string {
    const meetingDate = meeting.date
      ? new Date(meeting.date).toLocaleDateString()
      : 'No date set';
    const meetingTime = meeting.time || 'No time set';
    const location = meeting.location || 'Not specified';
    const duration = meeting.duration || 'Not specified';

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Meeting Scheduled</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #d1e7dd; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
      .meeting-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
      .btn { display: inline-block; padding: 10px 20px; background: #198754; color: white; text-decoration: none; border-radius: 5px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/dxkau0eb3/image/upload/v1755677291/propiaImage_iwm9j8.jpg" 
             alt="Meeting Banner" 
             style="max-width: 100%; border-radius: 5px;"/>
        <h2>✅ Meeting Scheduled</h2>
        <p>Hello ${user.name},</p>
        <p>Your meeting has been successfully scheduled with the following details:</p>
      </div>
      
      <div class="meeting-details">
        <h3>${meeting.title || 'Meeting'}</h3>
        <p><strong>Client:</strong> ${meeting.client || 'Not specified'}</p>
        <p><strong>Date:</strong> ${meetingDate}</p>
        <p><strong>Time:</strong> ${meetingTime}</p>
        <p><strong>Duration:</strong> ${duration}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Notes:</strong> ${meeting.notes || 'No additional notes'}</p>
        <p><strong>Status:</strong> ${meeting.status || 'Scheduled'}</p>
      </div>

      <p style="margin-top: 20px;">
        <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/meetings" class="btn">
          View Meeting Details
        </a>
      </p>

      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        This is an automated confirmation from your CRM system.
      </p>
    </div>
  </body>
  </html>
  `;
  }

private generateCallReminderEmail(call: Partial<Call>, user: Partial<User>): string {
  const callDate = call.date ? new Date(call.date).toLocaleDateString() : 'No date set';
  const callTime = call.time || 'No time set';
  const duration = call.duration || 'Not specified';
  const outcome = call.outcome || 'Not specified';
  const followUpInfo = call.followUpDate && call.followUpTime
    ? `<p><strong>Follow-Up:</strong> ${new Date(call.followUpDate).toLocaleDateString()} at ${call.followUpTime}</p>`
    : '';

  const userName = user.name || 'User';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Call Reminder</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #cfe2ff; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
    .call-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
    .btn { display: inline-block; padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://res.cloudinary.com/dxkau0eb3/image/upload/v1755677291/propiaImage_iwm9j8.jpg" 
           alt="Call Banner" 
           style="max-width: 100%; border-radius: 5px;"/>
      <h2>📞 Call Reminder</h2>
      <p>Hello ${userName},</p>
      <p>This is a reminder for your upcoming call with the following details:</p>
    </div>
    
    <div class="call-details">
      <p><strong>Outcome:</strong> ${outcome}</p>
      <p><strong>Date:</strong> ${callDate}</p>
      <p><strong>Time:</strong> ${callTime}</p>
      <p><strong>Duration:</strong> ${duration}</p>
      ${followUpInfo}
      ${call.notes ? `<p><strong>Notes:</strong> ${call.notes}</p>` : ''}
    </div>

    <p style="margin-top: 20px;">
      <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/calls" class="btn">
        View Call Details
      </a>
    </p>

    <p style="margin-top: 20px; font-size: 12px; color: #666;">
      This is an automated reminder from your CRM system.
    </p>
  </div>
</body>
</html>
  `;
}





































  // Main Functions


  private generateTaskAssignmentEmail(task: Task, user: User, assignedBy: User): string {
    const dueDate = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : 'No due date set';
    const priorityColor = this.getPriorityColor(task.priority) || '#6c757d';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Task Assignment</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e3f2fd; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
        .task-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
        .priority { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
        .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://res.cloudinary.com/dxkau0eb3/image/upload/v1755677291/propiaImage_iwm9j8.jpg"
               alt="CRM Logo"
               style="max-width: 120px; margin-bottom: 10px;"/>
          <h2>📋 New Task Assignment</h2>
          <p>Hello ${user.name},</p>
          <p>You have been assigned a new task by <strong>${assignedBy.name}</strong>.</p>
        </div>
        
        <div class="task-details">
          <h3>${task.title}</h3>
          <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p><strong>Priority:</strong> <span class="priority" style="background: ${priorityColor}">${task.priority}</span></p>
          <p><strong>Type:</strong> ${task.type.replace(/_/g, ' ').toUpperCase()}</p>
          <p><strong>Assigned By:</strong> ${assignedBy.name}</p>
        </div>
        
        <p style="margin-top: 20px;">
          <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/tasks/${task.id}" class="btn">
            View Task Details
          </a>
        </p>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          This is an automated notification from your CRM system.
        </p>
      </div>
    </body>
    </html>
  `;
  }

  private generateTaskUpdateEmail(task: Task, user: User): string {
    const dueDate = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : 'No due date set';
    const priorityColor = this.getPriorityColor(task.priority) || '#6c757d';

    const headerBg =
      task.priority === 'high'
        ? '#f8d7da' // أحمر فاتح
        : task.priority === 'medium'
          ? '#fff3cd' // أصفر
          : '#d1e7dd'; // أخضر فاتح

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Task Updated</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${headerBg}; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
        .task-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
        .priority { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
        .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://res.cloudinary.com/dxkau0eb3/image/upload/v1755677291/propiaImage_iwm9j8.jpg"
               alt="CRM Logo"
               style="max-width: 120px; margin-bottom: 10px;"/>
          <h2>✏️ Task Updated</h2>
          <p>Hello ${user.name},</p>
          <p>A task you're assigned to has been updated.</p>
        </div>
        
        <div class="task-details">
          <h3>${task.title}</h3>
          <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p><strong>Priority:</strong> <span class="priority" style="background: ${priorityColor}">${task.priority}</span></p>
          <p><strong>Type:</strong> ${task.type.replace(/_/g, ' ').toUpperCase()}</p>
          <p><strong>Status:</strong> ${task.status.replace(/_/g, ' ').toUpperCase()}</p>
        </div>
        
        <p style="margin-top: 20px;">
          <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/tasks/${task.id}" class="btn">
            View Task Details
          </a>
        </p>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          This is an automated notification from your CRM system.
        </p>
      </div>
    </body>
    </html>
  `;
  }

  private generateMeetingUpdateEmail(meeting: Meeting, user: User): string {
    const meetingDate = meeting.date
      ? new Date(meeting.date).toLocaleDateString()
      : 'No date set';
    const meetingTime = meeting.time || 'No time set';
    const location = meeting.location || 'Not specified';
    const duration = meeting.duration || 'Not specified';

    // اختيار لون الـ header حسب حالة الـ meeting
    // const headerBg =
    //   meeting.status === 'CANCELLED'
    //     ? '#f8d7da' // أحمر فاتح
    //     : meeting.status === 'RESCHEDULED'
    //     ? '#fff3cd' // أصفر
    //     : '#d1e7dd'; // أخضر فاتح (باقي الحالات)

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Meeting Updated</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background:  padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
      .meeting-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
      .btn { display: inline-block; padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 5px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/dxkau0eb3/image/upload/v1755677291/propiaImage_iwm9j8.jpg" 
             alt="Meeting Banner" 
             style="max-width: 100%; border-radius: 5px;"/>
        <h2>✏️ Meeting Updated</h2>
        <p>Hello ${user.name},</p>
        <p>A meeting you are assigned to has been updated.</p>
      </div>
      
      <div class="meeting-details">
        <h3>${meeting.title || 'Meeting'}</h3>
        <p><strong>Client:</strong> ${meeting.client || 'Not specified'}</p>
        <p><strong>Date:</strong> ${meetingDate}</p>
        <p><strong>Time:</strong> ${meetingTime}</p>
        <p><strong>Duration:</strong> ${duration}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Notes:</strong> ${meeting.notes || 'No additional notes'}</p>
        <p><strong>Status:</strong> ${meeting.status || 'Scheduled'}</p>
      </div>

      <p style="margin-top: 20px;">
        <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/meetings/${meeting.id}" class="btn">
          View Meeting Details
        </a>
      </p>

      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        This is an automated notification from your CRM system.
      </p>
    </div>
  </body>
  </html>
  `;
  }





  // Secudeul Meeting and Send Remider















  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return '#dc3545';
      case 'high':
        return '#fd7e14';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

















  async sendMeetingCreation(meeting: Meeting, user: User): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('EMAIL_USER'),
        to: user.email,
        subject: `Meeting Confirmation: ${meeting.title || 'Scheduled Meeting'}`,
        html: this.generateMeetingConfirmationEmail(meeting, user),
      };

      await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Meeting confirmation sent to ${user.email} for meeting: ${meeting.title}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send meeting confirmation: ${error.message}`);
      return false;
    }
  }
  async sendMeetingUpdate(meeting: Meeting, user: User): Promise<boolean> {
    console.log("user In Send Email Meeting", user);

    try {
      const mailOptions = {
        from: this.configService.get('EMAIL_USER'),
        to: user.email,
        subject: `Meeting Updated: ${meeting.title || 'Meeting Update'}`, // غير العنوان
        html: this.generateMeetingUpdateEmail(meeting, user), // HTML مخصص للتحديث
      };

      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Meeting update sent to ${user.email} for meeting: ${meeting.title}`); // غير الرسالة
      return true;
    } catch (error) {
      this.logger.error(`Failed to send meeting update: ${error.message}`); // غير الرسالة
      return false;
    }
  }
  async sendMeetingReminder(meeting: Meeting, user: User): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('EMAIL_USER'),
        to: user.email,
        subject: `Meeting Reminder: ${meeting.title || 'Upcoming Meeting'}`,
        html: this.generateMeetingReminderEmail(meeting, user),
      };

      await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Meeting reminder sent to ${user.email} for meeting: ${meeting.title}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send meeting reminder: ${error.message}`);
      return false;
    }
  }

  async scheduleMeetingReminder(meeting: Meeting, user: User) {
    if (!meeting.date || !meeting.time) return;
    console.log(meeting);

    const meetingDate = new Date(meeting.date); // هنا عندك التاريخ بس
    const [hours, minutes] = meeting.time.split(':').map(Number);

    // نضبط الساعة والدقيقة
    meetingDate.setHours(hours, minutes, 0, 0);

    const meetingDateTime = meetingDate;
    // const reminderTime = new Date(meetingDateTime.getTime() - 60 * 1000);
    // reminder قبل دقيقة
    const reminderTime = new Date(meetingDateTime.getTime() - 60 * 1000);
    console.log('Meeting DateTime:', meetingDateTime);
    console.log('ReminderTime:', reminderTime);
    console.log('Now:', new Date());
    if (reminderTime <= new Date()) {
      this.logger.warn(`Reminder time already passed for meeting: ${meeting.id}`);
      return;
    }

    const job = new CronJob(reminderTime, async () => {
      this.logger.log(`Sending reminder for meeting: ${meeting.id}`);
      await this.sendMeetingReminder(meeting, user);
      this.schedulerRegistry.deleteCronJob(`meeting-reminder-${meeting.id}`);
    });

    this.schedulerRegistry.addCronJob(`meeting-reminder-${meeting.id}`, job);
    job.start();

    this.logger.log(
      `Scheduled reminder for meeting: ${meeting.id} at ${reminderTime}`,
    );
  }


  // Email For Calls
  async sendCallReminder(call: Call, user: User): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('EMAIL_USER'),
        to: user.email,
        subject: `Call Reminder: ${call.outcome || 'Upcoming Call'}`,
        html: this.generateCallReminderEmail(call, user),
      };

      await this.transporter.sendMail(mailOptions);

      this.logger.log(`Call reminder sent to ${user.email} for call: ${call.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send call reminder: ${error.message}`);
      return false;
    }
  }
async scheduleCallFollowUpReminder(call: Call, user: User) {
  if (!call.followUpDate || !call.followUpTime) return;

  const [year, month, day] = call.followUpDate.split('-').map(Number);
  const [hours, minutes] = call.followUpTime.split(':').map(Number);
  const followUpDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (followUpDateTime <= new Date()) {
    this.logger.warn(`Follow-up reminder time already passed for call: ${call.id}`);
    return;
  }

  // Serialized objects
  const serializedCall = {
    id: call.id,
    outcome: call.outcome,
    date: call.date,
    time: call.time,
    followUpDate: call.followUpDate,
    followUpTime: call.followUpTime,
    notes: call.notes || '',
  };

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };
console.log("serilersing",serializedUser)


console.log("follow Up Date",followUpDateTime);


const job = new CronJob(
  followUpDateTime,          // time
  async () => {              // onTick
    this.logger.log(`Sending follow-up reminder for call: ${serializedCall.id}`);
    await this.sendCallReminder(serializedCall as Call, serializedUser as User);
    this.schedulerRegistry.deleteCronJob(`call-reminder-${serializedCall.id}`);
  },
  null,                      // onComplete
  true,                      // start immediately
  'Africa/Cairo'             // timeZone
);

  this.schedulerRegistry.addCronJob(`call-reminder-${serializedCall.id}`, job);
  job.start();

  this.logger.log(`Scheduled follow-up reminder for call: ${serializedCall.id} at ${followUpDateTime}`);
}








  async sendTaskAssignment(task: Task, user: User, assignedBy: User): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('EMAIL_USER'),
        to: user.email,
        subject: `New Task Assigned: ${task.title}`,
        html: this.generateTaskAssignmentEmail(task, user, assignedBy),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(result);
      this.logger.log(`Task assignment sent to ${user.email} for task: ${task.title}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send task assignment: ${error.message}`);
      return false;
    }
  }

  async sendTaskUpdate(task: Task, user: User): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('GMAIL_USER'),
        to: user.email,
        subject: `Task Updated: ${task.title}`,
        html: this.generateTaskUpdateEmail(task, user),
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Task update sent to ${user.email} for task: ${task.title}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send task update: ${error.message}`);
      return false;
    }
  }



  async sendTaskReminder(task: Task, user: User): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('EMAIL_USER'),
        to: user.email,
        subject: `Task Reminder: ${task.title}`,
        html: this.generateTaskReminderEmail(task, user),
      };




      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Task reminder sent to ${user.email} for task: ${task.title}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send task reminder: ${error.message}`);
      return false;
    }
  }




  async scheduleTaskReminder(task: Task, user: User) {
    if (!task.dueDate) return;

    console.log(task);

    // التاريخ + الساعة بتاعة تسليم التاسك
    const taskDateTime = new Date(task.dueDate);

    // لو عندك reminderTime manual، يبقى نستخدمه
    let reminderTime: Date;
    if (task.reminderTime) {
      reminderTime = new Date(task.reminderTime);
    } else {
      // بشكل افتراضي: قبل دقيقة من الـ dueDate
      reminderTime = new Date(taskDateTime.getTime() - 60 * 1000);
    }

    // console.log('Task DueDateTime:', taskDateTime);
    // console.log('ReminderTime:', reminderTime);
    // console.log('Now:', new Date());

    if (reminderTime <= new Date()) {
      this.logger.warn(`Reminder time already passed for task: ${task.id}`);
      return;
    }

    const job = new CronJob(reminderTime, async () => {
      this.logger.log(`Sending reminder for task: ${task.id}`);
      await this.sendTaskReminder(task, user);
      this.schedulerRegistry.deleteCronJob(`task-reminder-${task.id}`);
    });

    this.schedulerRegistry.addCronJob(`task-reminder-${task.id}`, job);
    job.start();

    this.logger.log(
      `Scheduled reminder for task: ${task.id} at ${reminderTime}`,
    );
  }










} 