import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus, TaskPriority, TaskType } from './types';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  // 🔄 Serialize Prisma task to API response format
  private serializeTask(task: any): Task {
    return {
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      reminderTime: task.reminderTime ? task.reminderTime.toISOString() : null,
      createdAt: task.createdAt ? task.createdAt.toISOString() : null,
      updatedAt: task.updatedAt ? task.updatedAt.toISOString() : null,
    };
  }













  // 🔄 Serialize array of tasks
  private serializeTasks(tasks: any[]): Task[] {
    return tasks.map(task => this.serializeTask(task));
  }

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    try {
      // Debug logging
      this.logger.log(`Creating task with userId: ${userId}`);
      this.logger.log(`createTaskDto: ${JSON.stringify(createTaskDto)}`);

      // Validate userId
      if (!userId) {
        throw new BadRequestException('User ID is required to create a task');
      }

      // Prepare data for task creation, handling optional foreign keys
      const taskData: any = {
        title: createTaskDto.title,
        description: createTaskDto.description,
        dueDate: createTaskDto.dueDate, // Keep as string - let Prisma handle the conversion
        priority: createTaskDto.priority || 'medium',
        status: createTaskDto.status || 'pending',
        type: createTaskDto.type,
        reminder: createTaskDto.reminder ?? true,
        reminderTime: createTaskDto.reminderTime, // Keep as string - let Prisma handle the conversion
        assignedToId: createTaskDto.assignedToId || userId, // Default to creator if not assigned
        createdById: userId,
      };

      this.logger.log(`Task data prepared: ${JSON.stringify(taskData)}`);

      // Only add foreign keys if they are provided and not empty
      if (createTaskDto.leadId && createTaskDto.leadId.trim() !== '') {
        taskData.leadId = createTaskDto.leadId;
      }
      if (createTaskDto.projectId && createTaskDto.projectId.trim() !== '') {
        taskData.projectId = createTaskDto.projectId;
      }
      if (createTaskDto.inventoryId && createTaskDto.inventoryId.trim() !== '') {
        taskData.inventoryId = createTaskDto.inventoryId;
      }

      const task = await this.prisma.task.create({
        data: taskData,
        include: {
          assignedTo: true,
          createdBy: true,
          lead: true,
          project: true,
          inventory: true,
        },
      });

      // Debug logging for created task
      this.logger.log(`Task created successfully:`);
      this.logger.log(`  ID: ${task.id}`);
      this.logger.log(`  Title: ${task.title}`);
      this.logger.log(`  Created By ID: ${task.createdById}`);
      this.logger.log(`  Assigned To ID: ${task.assignedToId}`);
      this.logger.log(`  Created At: ${task.createdAt}`);
      this.logger.log(`  Due Date: ${task.dueDate}`);

      // Send email notification if task is assigned to someone other than the creator
      if (task.assignedTo && task.assignedToId !== userId && task.createdBy) {
        const serializedTask: Task = this.serializeTask(task);
        await this.emailService.sendTaskAssignment(serializedTask, task.assignedTo, task.createdBy);
        await this.emailService.scheduleTaskReminder(serializedTask, task.assignedTo);
      }

      this.logger.log(`Task created: ${task.title} by user ${userId}`);
      return this.serializeTask(task);
    } catch (error) {
      this.logger.error(`Error creating task: ${error.message}`);

      // Provide more specific error messages
      if (error.message.includes('Foreign key constraint violated')) {
        if (error.message.includes('leadId')) {
          throw new BadRequestException('The specified lead does not exist');
        }
        if (error.message.includes('projectId')) {
          throw new BadRequestException('The specified project does not exist');
        }
        if (error.message.includes('inventoryId')) {
          throw new BadRequestException('The specified inventory does not exist');
        }
        if (error.message.includes('assignedToId')) {
          throw new BadRequestException('The specified user does not exist');
        }
      }

      throw new BadRequestException('Failed to create task');
    }
  }

  async findAll(query: any = {}, userId: string, userRole: string): Promise<Task[]> {
    const {
      status,
      priority,
      type,
      assignedToId,
      createdById,
      leadId,
      projectId,
      inventoryId,
      dueDateFrom,
      dueDateTo,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    // 🔒 Access Control: Non-admin users can only see their own tasks
    if (userRole !== 'admin') {
      where.OR = [
        { createdById: userId },    // Tasks they created
        { assignedToId: userId },   // Tasks assigned to them
      ];
    }
    // Admin can see all tasks (no additional where clause needed)

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (assignedToId) where.assignedToId = assignedToId;
    if (createdById) where.createdById = createdById;
    if (leadId) where.leadId = leadId;
    if (projectId) where.projectId = projectId;
    if (inventoryId) where.inventoryId = inventoryId;

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = dueDateFrom; // Keep as string - Prisma will handle conversion
      if (dueDateTo) where.dueDate.lte = dueDateTo; // Keep as string - Prisma will handle conversion
    }

    try {
      const tasks = await this.prisma.task.findMany({
        where,
        include: {
          assignedTo: true,
          createdBy: true,
          lead: true,
          project: true,
          inventory: true,
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: parseInt(limit),
      });

      this.logger.log(`User ${userId} (${userRole}) fetched ${tasks.length} tasks`);
      return this.serializeTasks(tasks);
    } catch (error) {
      this.logger.error(`Error fetching tasks: ${error.message}`);
      throw new BadRequestException('Failed to fetch tasks');
    }
  }

  async findOne(id: string, userId: string, userRole: string): Promise<Task> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
        include: {
          assignedTo: true,
          createdBy: true,
          lead: true,
          project: true,
          inventory: true,
        },
      });

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // 🔒 Access Control: Non-admin users can only access their own tasks
      if (userRole !== 'admin') {
        if (task.createdById !== userId && task.assignedToId !== userId) {
          throw new NotFoundException(`Task with ID ${id} not found`);
        }
      }

      this.logger.log(`User ${userId} (${userRole}) accessed task ${id}`);
      return this.serializeTask(task);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching task: ${error.message}`);
      throw new BadRequestException('Failed to fetch task');
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: string): Promise<Task> {
    try {
      // Check if task exists
      const existingTask = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // 🔒 Access Control: Non-admin users can only update their own tasks
      if (userRole !== 'admin') {
        if (existingTask.createdById !== userId && existingTask.assignedToId !== userId) {
          throw new NotFoundException(`Task with ID ${id} not found`);
        }
      }

      // Prepare update data
      const updateData: any = {};

      if (updateTaskDto.title !== undefined) updateData.title = updateTaskDto.title;
      if (updateTaskDto.description !== undefined) updateData.description = updateTaskDto.description;
      if (updateTaskDto.dueDate !== undefined) updateData.dueDate = updateTaskDto.dueDate; // Keep as string
      if (updateTaskDto.priority !== undefined) updateData.priority = updateTaskDto.priority;
      if (updateTaskDto.status !== undefined) updateData.status = updateTaskDto.status;
      if (updateTaskDto.type !== undefined) updateData.type = updateTaskDto.type;
      if (updateTaskDto.reminder !== undefined) updateData.reminder = updateTaskDto.reminder;
      if (updateTaskDto.reminderTime !== undefined) {
        updateData.reminderTime = updateTaskDto.reminderTime; // Keep as string
      }

      // Handle optional foreign keys
      if (updateTaskDto.assignedToId !== undefined) {
        updateData.assignedToId = updateTaskDto.assignedToId || null;
      }
      if (updateTaskDto.leadId !== undefined) {
        updateData.leadId = updateTaskDto.leadId && updateTaskDto.leadId.trim() !== '' ? updateTaskDto.leadId : null;
      }
      if (updateTaskDto.projectId !== undefined) {
        updateData.projectId = updateTaskDto.projectId && updateTaskDto.projectId.trim() !== '' ? updateTaskDto.projectId : null;
      }
      if (updateTaskDto.inventoryId !== undefined) {
        updateData.inventoryId = updateTaskDto.inventoryId && updateTaskDto.inventoryId.trim() !== '' ? updateTaskDto.inventoryId : null;
      }

      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          assignedTo: true,
          createdBy: true,
          lead: true,
          project: true,
          inventory: true,
        },
      });

      // ✉️ إرسال إيميل تحديث التاسك
      if (updatedTask.assignedTo) {
        const serializedTask: Task = this.serializeTask(updatedTask);
        await this.emailService.sendTaskUpdate(serializedTask, updatedTask.assignedTo);
      }

      this.logger.log(`Task updated: ${updatedTask.title} by user ${userId}`);
      return this.serializeTask(updatedTask);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating task: ${error.message}`);

      // Provide specific error messages for foreign key violations
      if (error.message.includes('Foreign key constraint violated')) {
        if (error.message.includes('leadId')) {
          throw new BadRequestException('The specified lead does not exist');
        }
        if (error.message.includes('projectId')) {
          throw new BadRequestException('The specified project does not exist');
        }
        if (error.message.includes('inventoryId')) {
          throw new BadRequestException('The specified inventory does not exist');
        }
        if (error.message.includes('assignedToId')) {
          throw new BadRequestException('The specified user does not exist');
        }
      }

      throw new BadRequestException('Failed to update task');
    }
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // 🔒 Access Control: Non-admin users can only delete their own tasks
      if (userRole !== 'admin') {
        if (task.createdById !== userId && task.assignedToId !== userId) {
          throw new NotFoundException(`Task with ID ${id} not found`);
        }
      }

      await this.prisma.task.delete({
        where: { id },
      });

      this.logger.log(`Task deleted: ${task.title} by user ${userId}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting task: ${error.message}`);
      throw new BadRequestException('Failed to delete task');
    }
  }

  async updateStatus(id: string, status: string, userId: string, userRole: string): Promise<Task> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // 🔒 Access Control: Non-admin users can only update status of their own tasks
      if (userRole !== 'admin') {
        if (task.createdById !== userId && task.assignedToId !== userId) {
          throw new NotFoundException(`Task with ID ${id} not found`);
        }
      }

      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: { status: status as any },
        include: {
          assignedTo: true,
          createdBy: true,
          lead: true,
          project: true,
          inventory: true,
        },
      });

      this.logger.log(`Task status updated: ${updatedTask.title} to ${status} by user ${userId}`);
      return this.serializeTask(updatedTask);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating task status: ${error.message}`);
      throw new BadRequestException('Failed to update task status');
    }
  }

  async getTasksByUser(userId: string, query: any = {}): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: {
          OR: [
            { createdById: userId },
            { assignedToId: userId },
          ],
        },
        include: {
          assignedTo: true,
          createdBy: true,
          lead: true,
          project: true,
          inventory: true,
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      this.logger.log(`User ${userId} fetched ${tasks.length} of their own tasks`);
      return this.serializeTasks(tasks);
    } catch (error) {
      this.logger.error(`Error fetching user tasks: ${error.message}`);
      throw new BadRequestException('Failed to fetch user tasks');
    }
  }

  async getTasksByLead(leadId: string): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: { leadId },
        include: {
          assignedTo: true,
          createdBy: true,
          lead: true,
          project: true,
          inventory: true,
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      this.logger.log(`Fetched ${tasks.length} tasks for lead ${leadId}`);
      return this.serializeTasks(tasks);
    } catch (error) {
      this.logger.error(`Error fetching lead tasks: ${error.message}`);
      throw new BadRequestException('Failed to fetch lead tasks');
    }
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: { projectId },
        include: {
          assignedTo: true,
          createdBy: true,
          lead: true,
          project: true,
          inventory: true,
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      this.logger.log(`Fetched ${tasks.length} tasks for project ${projectId}`);
      return this.serializeTasks(tasks);
    } catch (error) {
      this.logger.error(`Error fetching project tasks: ${error.message}`);
      throw new BadRequestException('Failed to fetch project tasks');
    }
  }

  async getTaskStatistics(): Promise<any> {
    // Temporary mock implementation
    this.logger.log('Tasks getTaskStatistics called');
    return {
      totalTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      tasksByPriority: [],
      tasksByType: [],
      completionRate: 0,
    };
  }
} 