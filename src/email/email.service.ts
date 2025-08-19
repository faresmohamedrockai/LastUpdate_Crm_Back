import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '@prisma/client';
import { Task,Meeting } from '../tasks/types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
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
      .header { background: #cfe2ff; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
      .meeting-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
      .btn { display: inline-block; padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 5px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
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

async sendMeetingReminder(meeting: Meeting, user: User): Promise<boolean> {
  try {
    const mailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to: user.email,
      subject: `Meeting Reminder: ${meeting.title || 'Upcoming Meeting'}`,
      
      html: this.generateMeetingReminderEmail(meeting, user),
    };

    const result = await this.transporter.sendMail(mailOptions);

    this.logger.log(`Meeting reminder sent to ${user.email} for meeting: ${meeting.title}`);
    return true;
  } catch (error) {
    this.logger.error(`Failed to send meeting reminder: ${error.message}`);
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

  private generateTaskAssignmentEmail(task: Task, user: User, assignedBy: User): string {
console.log(task)

    const dueDate = new Date(task.dueDate).toLocaleDateString();
    const priorityColor = this.getPriorityColor(task.priority);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Task Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e3f2fd; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .task-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
          .priority { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
          .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 New Task Assignment</h2>
            <p>Hello ${user.name},</p>
            <p>You have been assigned a new task by ${assignedBy.name}.</p>
          </div>
          
          <div class="task-details">
            <h3>${task.title}</h3>
           
            <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p><strong>Priority:</strong> <span class="priority" style="background: ${priorityColor}">${task.priority}</span></p>
            <p><strong>Type:</strong> ${task.type.replace('_', ' ').toUpperCase()}</p>
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
    const dueDate = new Date(task.dueDate).toLocaleDateString();
    const priorityColor = this.getPriorityColor(task.priority);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Task Updated</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .task-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }
          .priority { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
          .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✏️ Task Updated</h2>
            <p>Hello ${user.name},</p>
            <p>A task you're assigned to has been updated.</p>
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
            This is an automated notification from your CRM system.
          </p>
        </div>
      </body>
      </html>
    `;
  }

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




} 