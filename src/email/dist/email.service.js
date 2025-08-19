"use strict";
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
exports.EmailService = void 0;
var common_1 = require("@nestjs/common");
var nodemailer = require("nodemailer");
var EmailService = /** @class */ (function () {
    function EmailService(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.initializeTransporter();
    }
    EmailService_1 = EmailService;
    EmailService.prototype.initializeTransporter = function () {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('GMAIL_HOST', 'smtp.gmail.com'),
            port: Number(this.configService.get('GMAIL_PORT', 587)),
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS')
            }
        });
    };
    EmailService.prototype.generateMeetingReminderEmail = function (meeting, user) {
        var meetingDate = meeting.date
            ? new Date(meeting.date).toLocaleDateString()
            : 'No date set';
        var meetingTime = meeting.time || 'No time set';
        var location = meeting.location || 'Not specified';
        var duration = meeting.duration || 'Not specified';
        return "\n  <!DOCTYPE html>\n  <html>\n  <head>\n    <meta charset=\"utf-8\">\n    <title>Meeting Reminder</title>\n    <style>\n      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n      .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n      .header { background: #cfe2ff; padding: 20px; border-radius: 5px; margin-bottom: 20px; }\n      .meeting-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }\n      .btn { display: inline-block; padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 5px; }\n    </style>\n  </head>\n  <body>\n    <div class=\"container\">\n      <div class=\"header\">\n        <h2>\u23F0 Meeting Reminder</h2>\n        <p>Hello " + user.name + ",</p>\n        <p>This is a reminder for your upcoming meeting.</p>\n      </div>\n      \n      <div class=\"meeting-details\">\n        <h3>" + (meeting.title || 'Meeting') + "</h3>\n        <p><strong>Client:</strong> " + (meeting.client || 'Not specified') + "</p>\n        <p><strong>Date:</strong> " + meetingDate + "</p>\n        <p><strong>Time:</strong> " + meetingTime + "</p>\n        <p><strong>Duration:</strong> " + duration + "</p>\n        <p><strong>Location:</strong> " + location + "</p>\n        <p><strong>Notes:</strong> " + (meeting.notes || 'No additional notes') + "</p>\n        <p><strong>Status:</strong> " + (meeting.status || 'Scheduled') + "</p>\n      </div>\n\n      <p style=\"margin-top: 20px;\">\n        <a href=\"" + this.configService.get('FRONTEND_URL', 'http://localhost:5173') + "/meetings\" class=\"btn\">\n          View Meeting Details\n        </a>\n      </p>\n\n      <p style=\"margin-top: 20px; font-size: 12px; color: #666;\">\n        This is an automated notification from your CRM system.\n      </p>\n    </div>\n  </body>\n  </html>\n  ";
    };
    EmailService.prototype.sendMeetingReminder = function (meeting, user) {
        return __awaiter(this, void 0, Promise, function () {
            var mailOptions, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        mailOptions = {
                            from: this.configService.get('EMAIL_USER'),
                            to: user.email,
                            subject: "Meeting Reminder: " + (meeting.title || 'Upcoming Meeting'),
                            html: this.generateMeetingReminderEmail(meeting, user)
                        };
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 1:
                        result = _a.sent();
                        this.logger.log("Meeting reminder sent to " + user.email + " for meeting: " + meeting.title);
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error("Failed to send meeting reminder: " + error_1.message);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.sendTaskReminder = function (task, user) {
        return __awaiter(this, void 0, Promise, function () {
            var mailOptions, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        mailOptions = {
                            from: this.configService.get('EMAIL_USER'),
                            to: user.email,
                            subject: "Task Reminder: " + task.title,
                            html: this.generateTaskReminderEmail(task, user)
                        };
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 1:
                        result = _a.sent();
                        this.logger.log("Task reminder sent to " + user.email + " for task: " + task.title);
                        return [2 /*return*/, true];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error("Failed to send task reminder: " + error_2.message);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.sendTaskAssignment = function (task, user, assignedBy) {
        return __awaiter(this, void 0, Promise, function () {
            var mailOptions, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        mailOptions = {
                            from: this.configService.get('EMAIL_USER'),
                            to: user.email,
                            subject: "New Task Assigned: " + task.title,
                            html: this.generateTaskAssignmentEmail(task, user, assignedBy)
                        };
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 1:
                        result = _a.sent();
                        console.log(result);
                        this.logger.log("Task assignment sent to " + user.email + " for task: " + task.title);
                        return [2 /*return*/, true];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error("Failed to send task assignment: " + error_3.message);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.sendTaskUpdate = function (task, user) {
        return __awaiter(this, void 0, Promise, function () {
            var mailOptions, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        mailOptions = {
                            from: this.configService.get('GMAIL_USER'),
                            to: user.email,
                            subject: "Task Updated: " + task.title,
                            html: this.generateTaskUpdateEmail(task, user)
                        };
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 1:
                        result = _a.sent();
                        this.logger.log("Task update sent to " + user.email + " for task: " + task.title);
                        return [2 /*return*/, true];
                    case 2:
                        error_4 = _a.sent();
                        this.logger.error("Failed to send task update: " + error_4.message);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.generateTaskReminderEmail = function (task, user) {
        var dueDate = new Date(task.dueDate).toLocaleDateString();
        var priorityColor = this.getPriorityColor(task.priority);
        return "\n      <!DOCTYPE html>\n      <html>\n      <head>\n        <meta charset=\"utf-8\">\n        <title>Task Reminder</title>\n        <style>\n          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n          .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n          .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }\n          .task-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }\n          .priority { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }\n          .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }\n        </style>\n      </head>\n      <body>\n        <div class=\"container\">\n          <div class=\"header\">\n            <h2>\uD83D\uDD14 Task Reminder</h2>\n            <p>Hello " + user.name + ",</p>\n            <p>This is a reminder for a task that's due soon.</p>\n          </div>\n          \n          <div class=\"task-details\">\n            <h3>" + task.title + "</h3>\n            <p><strong>Description:</strong> " + (task.description || 'No description provided') + "</p>\n            <p><strong>Due Date:</strong> " + dueDate + "</p>\n            <p><strong>Priority:</strong> <span class=\"priority\" style=\"background: " + priorityColor + "\">" + task.priority + "</span></p>\n            <p><strong>Type:</strong> " + task.type.replace('_', ' ').toUpperCase() + "</p>\n            <p><strong>Status:</strong> " + task.status.replace('_', ' ').toUpperCase() + "</p>\n          </div>\n          \n          <p style=\"margin-top: 20px;\">\n            <a href=\"" + this.configService.get('FRONTEND_URL', 'http://localhost:3000') + "/tasks/" + task.id + "\" class=\"btn\">\n              View Task Details\n            </a>\n          </p>\n          \n          <p style=\"margin-top: 20px; font-size: 12px; color: #666;\">\n            This is an automated reminder from your CRM system.\n          </p>\n        </div>\n      </body>\n      </html>\n    ";
    };
    EmailService.prototype.generateTaskAssignmentEmail = function (task, user, assignedBy) {
        console.log(task);
        var dueDate = new Date(task.dueDate).toLocaleDateString();
        var priorityColor = this.getPriorityColor(task.priority);
        return "\n      <!DOCTYPE html>\n      <html>\n      <head>\n        <meta charset=\"utf-8\">\n        <title>New Task Assignment</title>\n        <style>\n          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n          .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n          .header { background: #e3f2fd; padding: 20px; border-radius: 5px; margin-bottom: 20px; }\n          .task-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }\n          .priority { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }\n          .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }\n        </style>\n      </head>\n      <body>\n        <div class=\"container\">\n          <div class=\"header\">\n            <h2>\uD83D\uDCCB New Task Assignment</h2>\n            <p>Hello " + user.name + ",</p>\n            <p>You have been assigned a new task by " + assignedBy.name + ".</p>\n          </div>\n          \n          <div class=\"task-details\">\n            <h3>" + task.title + "</h3>\n           \n            <p><strong>Description:</strong> " + (task.description || 'No description provided') + "</p>\n            <p><strong>Due Date:</strong> " + dueDate + "</p>\n            <p><strong>Priority:</strong> <span class=\"priority\" style=\"background: " + priorityColor + "\">" + task.priority + "</span></p>\n            <p><strong>Type:</strong> " + task.type.replace('_', ' ').toUpperCase() + "</p>\n            <p><strong>Assigned By:</strong> " + assignedBy.name + "</p>\n          </div>\n          \n          <p style=\"margin-top: 20px;\">\n            <a href=\"" + this.configService.get('FRONTEND_URL', 'http://localhost:5173') + "/tasks/" + task.id + "\" class=\"btn\">\n              View Task Details\n            </a>\n          </p>\n          \n          <p style=\"margin-top: 20px; font-size: 12px; color: #666;\">\n            This is an automated notification from your CRM system.\n          </p>\n        </div>\n      </body>\n      </html>\n    ";
    };
    EmailService.prototype.generateTaskUpdateEmail = function (task, user) {
        var dueDate = new Date(task.dueDate).toLocaleDateString();
        var priorityColor = this.getPriorityColor(task.priority);
        return "\n      <!DOCTYPE html>\n      <html>\n      <head>\n        <meta charset=\"utf-8\">\n        <title>Task Updated</title>\n        <style>\n          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n          .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n          .header { background: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 20px; }\n          .task-details { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }\n          .priority { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }\n          .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }\n        </style>\n      </head>\n      <body>\n        <div class=\"container\">\n          <div class=\"header\">\n            <h2>\u270F\uFE0F Task Updated</h2>\n            <p>Hello " + user.name + ",</p>\n            <p>A task you're assigned to has been updated.</p>\n          </div>\n          \n          <div class=\"task-details\">\n            <h3>" + task.title + "</h3>\n            <p><strong>Description:</strong> " + (task.description || 'No description provided') + "</p>\n            <p><strong>Due Date:</strong> " + dueDate + "</p>\n            <p><strong>Priority:</strong> <span class=\"priority\" style=\"background: " + priorityColor + "\">" + task.priority + "</span></p>\n            <p><strong>Type:</strong> " + task.type.replace('_', ' ').toUpperCase() + "</p>\n            <p><strong>Status:</strong> " + task.status.replace('_', ' ').toUpperCase() + "</p>\n          </div>\n          \n          <p style=\"margin-top: 20px;\">\n            <a href=\"" + this.configService.get('FRONTEND_URL', 'http://localhost:3000') + "/tasks/" + task.id + "\" class=\"btn\">\n              View Task Details\n            </a>\n          </p>\n          \n          <p style=\"margin-top: 20px; font-size: 12px; color: #666;\">\n            This is an automated notification from your CRM system.\n          </p>\n        </div>\n      </body>\n      </html>\n    ";
    };
    EmailService.prototype.getPriorityColor = function (priority) {
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
    };
    var EmailService_1;
    EmailService = EmailService_1 = __decorate([
        common_1.Injectable()
    ], EmailService);
    return EmailService;
}());
exports.EmailService = EmailService;
