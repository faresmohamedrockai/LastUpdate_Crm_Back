"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.TasksService = void 0;
var common_1 = require("@nestjs/common");
var TasksService = /** @class */ (function () {
    function TasksService(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(TasksService_1.name);
    }
    TasksService_1 = TasksService;
    // 🔄 Serialize Prisma task to API response format
    TasksService.prototype.serializeTask = function (task) {
        return __assign(__assign({}, task), { dueDate: task.dueDate ? task.dueDate.toISOString() : null, reminderTime: task.reminderTime ? task.reminderTime.toISOString() : null, createdAt: task.createdAt ? task.createdAt.toISOString() : null, updatedAt: task.updatedAt ? task.updatedAt.toISOString() : null });
    };
    // 🔄 Serialize array of tasks
    TasksService.prototype.serializeTasks = function (tasks) {
        var _this = this;
        return tasks.map(function (task) { return _this.serializeTask(task); });
    };
    TasksService.prototype.create = function (createTaskDto, userId) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var taskData, task, serializedTask, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        // Debug logging
                        this.logger.log("Creating task with userId: " + userId);
                        this.logger.log("createTaskDto: " + JSON.stringify(createTaskDto));
                        // Validate userId
                        if (!userId) {
                            throw new common_1.BadRequestException('User ID is required to create a task');
                        }
                        taskData = {
                            title: createTaskDto.title,
                            description: createTaskDto.description,
                            dueDate: createTaskDto.dueDate,
                            priority: createTaskDto.priority || 'medium',
                            status: createTaskDto.status || 'pending',
                            type: createTaskDto.type,
                            reminder: (_a = createTaskDto.reminder) !== null && _a !== void 0 ? _a : true,
                            reminderTime: createTaskDto.reminderTime,
                            assignedToId: createTaskDto.assignedToId || userId,
                            createdById: userId
                        };
                        this.logger.log("Task data prepared: " + JSON.stringify(taskData));
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
                        return [4 /*yield*/, this.prisma.task.create({
                                data: taskData,
                                include: {
                                    assignedTo: true,
                                    createdBy: true,
                                    lead: true,
                                    project: true,
                                    inventory: true
                                }
                            })];
                    case 1:
                        task = _b.sent();
                        // Debug logging for created task
                        this.logger.log("Task created successfully:");
                        this.logger.log("  ID: " + task.id);
                        this.logger.log("  Title: " + task.title);
                        this.logger.log("  Created By ID: " + task.createdById);
                        this.logger.log("  Assigned To ID: " + task.assignedToId);
                        this.logger.log("  Created At: " + task.createdAt);
                        this.logger.log("  Due Date: " + task.dueDate);
                        if (!(task.assignedTo && task.assignedToId !== userId && task.createdBy)) return [3 /*break*/, 3];
                        serializedTask = this.serializeTask(task);
                        return [4 /*yield*/, this.emailService.sendTaskAssignment(serializedTask, task.assignedTo, task.createdBy)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        this.logger.log("Task created: " + task.title + " by user " + userId);
                        return [2 /*return*/, this.serializeTask(task)];
                    case 4:
                        error_1 = _b.sent();
                        this.logger.error("Error creating task: " + error_1.message);
                        // Provide more specific error messages
                        if (error_1.message.includes('Foreign key constraint violated')) {
                            if (error_1.message.includes('leadId')) {
                                throw new common_1.BadRequestException('The specified lead does not exist');
                            }
                            if (error_1.message.includes('projectId')) {
                                throw new common_1.BadRequestException('The specified project does not exist');
                            }
                            if (error_1.message.includes('inventoryId')) {
                                throw new common_1.BadRequestException('The specified inventory does not exist');
                            }
                            if (error_1.message.includes('assignedToId')) {
                                throw new common_1.BadRequestException('The specified user does not exist');
                            }
                        }
                        throw new common_1.BadRequestException('Failed to create task');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    TasksService.prototype.findAll = function (query, userId, userRole) {
        if (query === void 0) { query = {}; }
        return __awaiter(this, void 0, Promise, function () {
            var status, priority, type, assignedToId, createdById, leadId, projectId, inventoryId, dueDateFrom, dueDateTo, _a, page, _b, limit, skip, where, tasks, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        status = query.status, priority = query.priority, type = query.type, assignedToId = query.assignedToId, createdById = query.createdById, leadId = query.leadId, projectId = query.projectId, inventoryId = query.inventoryId, dueDateFrom = query.dueDateFrom, dueDateTo = query.dueDateTo, _a = query.page, page = _a === void 0 ? 1 : _a, _b = query.limit, limit = _b === void 0 ? 10 : _b;
                        skip = (page - 1) * limit;
                        where = {};
                        // 🔒 Access Control: Non-admin users can only see their own tasks
                        if (userRole !== 'admin') {
                            where.OR = [
                                { createdById: userId },
                                { assignedToId: userId },
                            ];
                        }
                        // Admin can see all tasks (no additional where clause needed)
                        if (status)
                            where.status = status;
                        if (priority)
                            where.priority = priority;
                        if (type)
                            where.type = type;
                        if (assignedToId)
                            where.assignedToId = assignedToId;
                        if (createdById)
                            where.createdById = createdById;
                        if (leadId)
                            where.leadId = leadId;
                        if (projectId)
                            where.projectId = projectId;
                        if (inventoryId)
                            where.inventoryId = inventoryId;
                        if (dueDateFrom || dueDateTo) {
                            where.dueDate = {};
                            if (dueDateFrom)
                                where.dueDate.gte = dueDateFrom; // Keep as string - Prisma will handle conversion
                            if (dueDateTo)
                                where.dueDate.lte = dueDateTo; // Keep as string - Prisma will handle conversion
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.prisma.task.findMany({
                                where: where,
                                include: {
                                    assignedTo: true,
                                    createdBy: true,
                                    lead: true,
                                    project: true,
                                    inventory: true
                                },
                                orderBy: [
                                    { priority: 'desc' },
                                    { dueDate: 'asc' },
                                    { createdAt: 'desc' },
                                ],
                                skip: skip,
                                take: parseInt(limit)
                            })];
                    case 2:
                        tasks = _c.sent();
                        this.logger.log("User " + userId + " (" + userRole + ") fetched " + tasks.length + " tasks");
                        return [2 /*return*/, this.serializeTasks(tasks)];
                    case 3:
                        error_2 = _c.sent();
                        this.logger.error("Error fetching tasks: " + error_2.message);
                        throw new common_1.BadRequestException('Failed to fetch tasks');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TasksService.prototype.findOne = function (id, userId, userRole) {
        return __awaiter(this, void 0, Promise, function () {
            var task, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.prisma.task.findUnique({
                                where: { id: id },
                                include: {
                                    assignedTo: true,
                                    createdBy: true,
                                    lead: true,
                                    project: true,
                                    inventory: true
                                }
                            })];
                    case 1:
                        task = _a.sent();
                        if (!task) {
                            throw new common_1.NotFoundException("Task with ID " + id + " not found");
                        }
                        // 🔒 Access Control: Non-admin users can only access their own tasks
                        if (userRole !== 'admin') {
                            if (task.createdById !== userId && task.assignedToId !== userId) {
                                throw new common_1.NotFoundException("Task with ID " + id + " not found");
                            }
                        }
                        this.logger.log("User " + userId + " (" + userRole + ") accessed task " + id);
                        return [2 /*return*/, this.serializeTask(task)];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof common_1.NotFoundException) {
                            throw error_3;
                        }
                        this.logger.error("Error fetching task: " + error_3.message);
                        throw new common_1.BadRequestException('Failed to fetch task');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TasksService.prototype.update = function (id, updateTaskDto, userId, userRole) {
        return __awaiter(this, void 0, Promise, function () {
            var existingTask, updateData, updatedTask, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.prisma.task.findUnique({
                                where: { id: id }
                            })];
                    case 1:
                        existingTask = _a.sent();
                        if (!existingTask) {
                            throw new common_1.NotFoundException("Task with ID " + id + " not found");
                        }
                        // 🔒 Access Control: Non-admin users can only update their own tasks
                        if (userRole !== 'admin') {
                            if (existingTask.createdById !== userId && existingTask.assignedToId !== userId) {
                                throw new common_1.NotFoundException("Task with ID " + id + " not found");
                            }
                        }
                        updateData = {};
                        if (updateTaskDto.title !== undefined)
                            updateData.title = updateTaskDto.title;
                        if (updateTaskDto.description !== undefined)
                            updateData.description = updateTaskDto.description;
                        if (updateTaskDto.dueDate !== undefined)
                            updateData.dueDate = updateTaskDto.dueDate; // Keep as string
                        if (updateTaskDto.priority !== undefined)
                            updateData.priority = updateTaskDto.priority;
                        if (updateTaskDto.status !== undefined)
                            updateData.status = updateTaskDto.status;
                        if (updateTaskDto.type !== undefined)
                            updateData.type = updateTaskDto.type;
                        if (updateTaskDto.reminder !== undefined)
                            updateData.reminder = updateTaskDto.reminder;
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
                        return [4 /*yield*/, this.prisma.task.update({
                                where: { id: id },
                                data: updateData,
                                include: {
                                    assignedTo: true,
                                    createdBy: true,
                                    lead: true,
                                    project: true,
                                    inventory: true
                                }
                            })];
                    case 2:
                        updatedTask = _a.sent();
                        this.logger.log("Task updated: " + updatedTask.title + " by user " + userId);
                        return [2 /*return*/, this.serializeTask(updatedTask)];
                    case 3:
                        error_4 = _a.sent();
                        if (error_4 instanceof common_1.NotFoundException) {
                            throw error_4;
                        }
                        this.logger.error("Error updating task: " + error_4.message);
                        // Provide specific error messages for foreign key violations
                        if (error_4.message.includes('Foreign key constraint violated')) {
                            if (error_4.message.includes('leadId')) {
                                throw new common_1.BadRequestException('The specified lead does not exist');
                            }
                            if (error_4.message.includes('projectId')) {
                                throw new common_1.BadRequestException('The specified project does not exist');
                            }
                            if (error_4.message.includes('inventoryId')) {
                                throw new common_1.BadRequestException('The specified inventory does not exist');
                            }
                            if (error_4.message.includes('assignedToId')) {
                                throw new common_1.BadRequestException('The specified user does not exist');
                            }
                        }
                        throw new common_1.BadRequestException('Failed to update task');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TasksService.prototype.remove = function (id, userId, userRole) {
        return __awaiter(this, void 0, Promise, function () {
            var task, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.prisma.task.findUnique({
                                where: { id: id }
                            })];
                    case 1:
                        task = _a.sent();
                        if (!task) {
                            throw new common_1.NotFoundException("Task with ID " + id + " not found");
                        }
                        // 🔒 Access Control: Non-admin users can only delete their own tasks
                        if (userRole !== 'admin') {
                            if (task.createdById !== userId && task.assignedToId !== userId) {
                                throw new common_1.NotFoundException("Task with ID " + id + " not found");
                            }
                        }
                        return [4 /*yield*/, this.prisma.task["delete"]({
                                where: { id: id }
                            })];
                    case 2:
                        _a.sent();
                        this.logger.log("Task deleted: " + task.title + " by user " + userId);
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        if (error_5 instanceof common_1.NotFoundException) {
                            throw error_5;
                        }
                        this.logger.error("Error deleting task: " + error_5.message);
                        throw new common_1.BadRequestException('Failed to delete task');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TasksService.prototype.updateStatus = function (id, status, userId, userRole) {
        return __awaiter(this, void 0, Promise, function () {
            var task, updatedTask, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.prisma.task.findUnique({
                                where: { id: id }
                            })];
                    case 1:
                        task = _a.sent();
                        if (!task) {
                            throw new common_1.NotFoundException("Task with ID " + id + " not found");
                        }
                        // 🔒 Access Control: Non-admin users can only update status of their own tasks
                        if (userRole !== 'admin') {
                            if (task.createdById !== userId && task.assignedToId !== userId) {
                                throw new common_1.NotFoundException("Task with ID " + id + " not found");
                            }
                        }
                        return [4 /*yield*/, this.prisma.task.update({
                                where: { id: id },
                                data: { status: status },
                                include: {
                                    assignedTo: true,
                                    createdBy: true,
                                    lead: true,
                                    project: true,
                                    inventory: true
                                }
                            })];
                    case 2:
                        updatedTask = _a.sent();
                        this.logger.log("Task status updated: " + updatedTask.title + " to " + status + " by user " + userId);
                        return [2 /*return*/, this.serializeTask(updatedTask)];
                    case 3:
                        error_6 = _a.sent();
                        if (error_6 instanceof common_1.NotFoundException) {
                            throw error_6;
                        }
                        this.logger.error("Error updating task status: " + error_6.message);
                        throw new common_1.BadRequestException('Failed to update task status');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TasksService.prototype.getTasksByUser = function (userId, query) {
        if (query === void 0) { query = {}; }
        return __awaiter(this, void 0, Promise, function () {
            var tasks, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.prisma.task.findMany({
                                where: {
                                    OR: [
                                        { createdById: userId },
                                        { assignedToId: userId },
                                    ]
                                },
                                include: {
                                    assignedTo: true,
                                    createdBy: true,
                                    lead: true,
                                    project: true,
                                    inventory: true
                                },
                                orderBy: [
                                    { priority: 'desc' },
                                    { dueDate: 'asc' },
                                    { createdAt: 'desc' },
                                ]
                            })];
                    case 1:
                        tasks = _a.sent();
                        this.logger.log("User " + userId + " fetched " + tasks.length + " of their own tasks");
                        return [2 /*return*/, this.serializeTasks(tasks)];
                    case 2:
                        error_7 = _a.sent();
                        this.logger.error("Error fetching user tasks: " + error_7.message);
                        throw new common_1.BadRequestException('Failed to fetch user tasks');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TasksService.prototype.getTasksByLead = function (leadId) {
        return __awaiter(this, void 0, Promise, function () {
            var tasks, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.prisma.task.findMany({
                                where: { leadId: leadId },
                                include: {
                                    assignedTo: true,
                                    createdBy: true,
                                    lead: true,
                                    project: true,
                                    inventory: true
                                },
                                orderBy: [
                                    { priority: 'desc' },
                                    { dueDate: 'asc' },
                                    { createdAt: 'desc' },
                                ]
                            })];
                    case 1:
                        tasks = _a.sent();
                        this.logger.log("Fetched " + tasks.length + " tasks for lead " + leadId);
                        return [2 /*return*/, this.serializeTasks(tasks)];
                    case 2:
                        error_8 = _a.sent();
                        this.logger.error("Error fetching lead tasks: " + error_8.message);
                        throw new common_1.BadRequestException('Failed to fetch lead tasks');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TasksService.prototype.getTasksByProject = function (projectId) {
        return __awaiter(this, void 0, Promise, function () {
            var tasks, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.prisma.task.findMany({
                                where: { projectId: projectId },
                                include: {
                                    assignedTo: true,
                                    createdBy: true,
                                    lead: true,
                                    project: true,
                                    inventory: true
                                },
                                orderBy: [
                                    { priority: 'desc' },
                                    { dueDate: 'asc' },
                                    { createdAt: 'desc' },
                                ]
                            })];
                    case 1:
                        tasks = _a.sent();
                        this.logger.log("Fetched " + tasks.length + " tasks for project " + projectId);
                        return [2 /*return*/, this.serializeTasks(tasks)];
                    case 2:
                        error_9 = _a.sent();
                        this.logger.error("Error fetching project tasks: " + error_9.message);
                        throw new common_1.BadRequestException('Failed to fetch project tasks');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TasksService.prototype.getTaskStatistics = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                // Temporary mock implementation
                this.logger.log('Tasks getTaskStatistics called');
                return [2 /*return*/, {
                        totalTasks: 0,
                        pendingTasks: 0,
                        inProgressTasks: 0,
                        completedTasks: 0,
                        overdueTasks: 0,
                        tasksByPriority: [],
                        tasksByType: [],
                        completionRate: 0
                    }];
            });
        });
    };
    var TasksService_1;
    TasksService = TasksService_1 = __decorate([
        common_1.Injectable()
    ], TasksService);
    return TasksService;
}());
exports.TasksService = TasksService;
