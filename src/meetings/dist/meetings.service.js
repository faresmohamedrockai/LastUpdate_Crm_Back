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
exports.MeetingsService = void 0;
var common_1 = require("@nestjs/common");
var MeetingsService = /** @class */ (function () {
    function MeetingsService(prisma, logsService, emailService) {
        this.prisma = prisma;
        this.logsService = logsService;
        this.emailService = emailService;
    }
    MeetingsService.prototype.serializeMeeting = function (meeting) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return __assign(__assign({}, meeting), { title: (_a = meeting.title) !== null && _a !== void 0 ? _a : undefined, client: (_b = meeting.client) !== null && _b !== void 0 ? _b : undefined, date: meeting.date ? new Date(meeting.date).toISOString() : undefined, time: (_c = meeting.time) !== null && _c !== void 0 ? _c : undefined, duration: (_d = meeting.duration) !== null && _d !== void 0 ? _d : undefined, type: (_e = meeting.type) !== null && _e !== void 0 ? _e : undefined, status: (_f = meeting.status) !== null && _f !== void 0 ? _f : undefined, notes: (_g = meeting.notes) !== null && _g !== void 0 ? _g : undefined, objections: (_h = meeting.objections) !== null && _h !== void 0 ? _h : undefined, location: (_j = meeting.location) !== null && _j !== void 0 ? _j : undefined, locationType: (_k = meeting.locationType) !== null && _k !== void 0 ? _k : undefined, inventory: (_l = meeting.inventory) !== null && _l !== void 0 ? _l : undefined, project: (_m = meeting.project) !== null && _m !== void 0 ? _m : undefined, lead: (_o = meeting.lead) !== null && _o !== void 0 ? _o : undefined, assignedTo: (_p = meeting.assignedTo) !== null && _p !== void 0 ? _p : undefined, createdBy: (_q = meeting.createdBy) !== null && _q !== void 0 ? _q : undefined, createdAt: meeting.createdAt ? meeting.createdAt.toISOString() : undefined, updatedAt: meeting.updatedAt ? meeting.updatedAt.toISOString() : undefined });
    };
    /**
     * Helper method to check if a user can access a specific meeting
     */
    MeetingsService.prototype.canAccessMeeting = function (meetingId, userId, role) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var meeting;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Admins and sales admins can access all meetings
                        if (role === 'admin' || role === 'sales_admin') {
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, this.prisma.meeting.findUnique({
                                where: { id: meetingId },
                                select: {
                                    createdById: true,
                                    assignedToId: true,
                                    createdBy: {
                                        select: { teamLeaderId: true }
                                    },
                                    assignedTo: {
                                        select: { teamLeaderId: true }
                                    }
                                }
                            })];
                    case 1:
                        meeting = _c.sent();
                        if (!meeting) {
                            return [2 /*return*/, false];
                        }
                        // Check if user created or is assigned to the meeting
                        if (meeting.createdById === userId || meeting.assignedToId === userId) {
                            return [2 /*return*/, true];
                        }
                        // If user is team leader, check if they can access team members' meetings
                        if (role === 'team_leader') {
                            // Check if the meeting was created by a team member
                            if (((_a = meeting.createdBy) === null || _a === void 0 ? void 0 : _a.teamLeaderId) === userId) {
                                return [2 /*return*/, true];
                            }
                            // Check if the meeting is assigned to a team member
                            if (((_b = meeting.assignedTo) === null || _b === void 0 ? void 0 : _b.teamLeaderId) === userId) {
                                return [2 /*return*/, true];
                            }
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    MeetingsService.prototype.createMeeting = function (dto, userId, email, role) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var meeting, serializedMeeting;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.prisma.meeting.create({
                            data: __assign(__assign(__assign(__assign({ title: dto.title, client: dto.client, date: (_a = dto.date) !== null && _a !== void 0 ? _a : null, time: dto.time, duration: dto.duration, type: dto.type, status: dto.status, locationType: dto.locationType, notes: dto.notes, objections: dto.objections, location: dto.location }, (dto.inventoryId && {
                                inventory: { connect: { id: dto.inventoryId } }
                            })), (dto.projectId && {
                                project: { connect: { id: dto.projectId } }
                            })), (dto.assignedToId && {
                                assignedTo: { connect: { id: dto.assignedToId } }
                            })), { createdBy: { connect: { id: userId } } }),
                            include: {
                                lead: true,
                                inventory: true,
                                project: true,
                                assignedTo: true,
                                createdBy: true
                            }
                        })];
                    case 1:
                        meeting = _b.sent();
                        if (!meeting.assignedTo) return [3 /*break*/, 3];
                        serializedMeeting = this.serializeMeeting(meeting);
                        if (!serializedMeeting.assignedTo) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.emailService.sendMeetingReminder(serializedMeeting, serializedMeeting.assignedTo)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/, {
                            status: 201,
                            message: 'Meeting created successfully',
                            meeting: this.serializeMeeting(meeting)
                        }];
                }
            });
        });
    };
    MeetingsService.prototype.getAllMeetings = function (userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, _a, teamMembers, teamMemberIds, meetings;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        whereClause = {};
                        _a = role;
                        switch (_a) {
                            case 'sales_rep': return [3 /*break*/, 1];
                            case 'team_leader': return [3 /*break*/, 2];
                            case 'sales_admin': return [3 /*break*/, 4];
                            case 'admin': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 5];
                    case 1:
                        // Sales reps can only see meetings they created or are assigned to
                        whereClause = {
                            OR: [
                                { createdById: userId },
                                { assignedToId: userId },
                            ]
                        };
                        return [3 /*break*/, 6];
                    case 2: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { teamLeaderId: userId },
                            select: { id: true }
                        })];
                    case 3:
                        teamMembers = _b.sent();
                        teamMemberIds = teamMembers.map(function (member) { return member.id; });
                        whereClause = {
                            OR: [
                                // Own meetings (created or assigned)
                                { createdById: userId },
                                { assignedToId: userId },
                                // Team members' meetings (created or assigned)
                                { createdById: { "in": teamMemberIds } },
                                { assignedToId: { "in": teamMemberIds } },
                            ]
                        };
                        return [3 /*break*/, 6];
                    case 4:
                        // Sales admins and admins can see all meetings
                        whereClause = {};
                        return [3 /*break*/, 6];
                    case 5:
                        // Default to sales_rep behavior for unknown roles
                        whereClause = {
                            OR: [
                                { createdById: userId },
                                { assignedToId: userId },
                            ]
                        };
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, this.prisma.meeting.findMany({
                            where: whereClause,
                            include: {
                                lead: true,
                                inventory: true,
                                project: true,
                                createdBy: true,
                                assignedTo: true
                            },
                            orderBy: {
                                createdAt: 'desc'
                            }
                        })];
                    case 7:
                        meetings = _b.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Meetings retrieved successfully',
                                meetings: meetings
                            }];
                }
            });
        });
    };
    MeetingsService.prototype.getMeetingsByProject = function (projectId, userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, _a, teamMembers, teamMemberIds, meetings;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        whereClause = {
                            projectId: projectId
                        };
                        _a = role;
                        switch (_a) {
                            case 'sales_rep': return [3 /*break*/, 1];
                            case 'team_leader': return [3 /*break*/, 2];
                            case 'sales_admin': return [3 /*break*/, 4];
                            case 'admin': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 5];
                    case 1:
                        whereClause = __assign(__assign({}, whereClause), { OR: [
                                { createdById: userId },
                                { assignedToId: userId },
                            ] });
                        return [3 /*break*/, 6];
                    case 2: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { teamLeaderId: userId },
                            select: { id: true }
                        })];
                    case 3:
                        teamMembers = _b.sent();
                        teamMemberIds = teamMembers.map(function (member) { return member.id; });
                        whereClause = __assign(__assign({}, whereClause), { OR: [
                                // Own meetings
                                { createdById: userId },
                                { assignedToId: userId },
                                // Team members' meetings
                                { createdById: { "in": teamMemberIds } },
                                { assignedToId: { "in": teamMemberIds } },
                            ] });
                        return [3 /*break*/, 6];
                    case 4: 
                    // No additional filtering for admins
                    return [3 /*break*/, 6];
                    case 5:
                        // Default to sales_rep behavior
                        whereClause = __assign(__assign({}, whereClause), { OR: [
                                { createdById: userId },
                                { assignedToId: userId },
                            ] });
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, this.prisma.meeting.findMany({
                            where: whereClause,
                            include: {
                                lead: true,
                                inventory: true,
                                project: true,
                                createdBy: true,
                                assignedTo: true
                            },
                            orderBy: {
                                createdAt: 'desc'
                            }
                        })];
                    case 7:
                        meetings = _b.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Project meetings retrieved successfully',
                                meetings: meetings
                            }];
                }
            });
        });
    };
    MeetingsService.prototype.updateMeeting = function (id, dto, userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var existingMeeting, canAccess, updatedMeeting, serializedMeeting;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.meeting.findUnique({
                            where: { id: id },
                            include: {
                                lead: true,
                                inventory: true,
                                project: true,
                                createdBy: true,
                                assignedTo: true
                            }
                        })];
                    case 1:
                        existingMeeting = _a.sent();
                        if (!existingMeeting) {
                            throw new common_1.NotFoundException('Meeting not found');
                        }
                        return [4 /*yield*/, this.canAccessMeeting(id, userId, role)];
                    case 2:
                        canAccess = _a.sent();
                        if (!canAccess) {
                            throw new common_1.NotFoundException('Meeting not found or access denied');
                        }
                        // 🟢 log البيانات قبل التحديث
                        console.log("Meeting before update: " + JSON.stringify(existingMeeting, null, 2));
                        console.log("Update DTO: " + JSON.stringify(dto, null, 2));
                        return [4 /*yield*/, this.prisma.meeting.update({
                                where: { id: id },
                                data: __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (dto.title && { title: dto.title })), (dto.client && { client: dto.client })), (dto.date && { date: dto.date })), (dto.time && { time: dto.time })), (dto.duration && { duration: dto.duration })), (dto.type && { type: dto.type })), (dto.status && { status: dto.status })), (dto.locationType && { locationType: dto.locationType })), (dto.notes && { notes: dto.notes })), (dto.objections && { objections: dto.objections })), (dto.location && { location: dto.location })), (dto.inventoryId && {
                                    inventory: { connect: { id: dto.inventoryId } }
                                })), (dto.projectId && {
                                    project: { connect: { id: dto.projectId } }
                                })), (dto.assignedToId && {
                                    assignedTo: { connect: { id: dto.assignedToId } }
                                })),
                                include: {
                                    lead: true,
                                    inventory: true,
                                    project: true,
                                    createdBy: true,
                                    assignedTo: true
                                }
                            })];
                    case 3:
                        updatedMeeting = _a.sent();
                        // 🟢 log البيانات بعد التحديث
                        // this.logger.debug(`Meeting after update: ${JSON.stringify(updatedMeeting, null, 2)}`);
                        // 4. تسجيل التحديث في الـ logs
                        return [4 /*yield*/, this.prisma.log.create({
                                data: {
                                    user: { connect: { id: userId } },
                                    email: email,
                                    userRole: role,
                                    action: 'update_meeting',
                                    description: "Updated meeting : status=" + dto.status + ", date=" + dto.date
                                }
                            })];
                    case 4:
                        // 🟢 log البيانات بعد التحديث
                        // this.logger.debug(`Meeting after update: ${JSON.stringify(updatedMeeting, null, 2)}`);
                        // 4. تسجيل التحديث في الـ logs
                        _a.sent();
                        if (!updatedMeeting.assignedTo) return [3 /*break*/, 6];
                        serializedMeeting = this.serializeMeeting(updatedMeeting);
                        if (!serializedMeeting.assignedTo) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.emailService.sendMeetingUpdate(serializedMeeting, serializedMeeting.assignedTo)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: 
                    // 6. الإرجاع
                    return [2 /*return*/, {
                            status: 200,
                            message: 'Meeting updated successfully',
                            meeting: this.serializeMeeting(updatedMeeting)
                        }];
                }
            });
        });
    };
    MeetingsService.prototype.deleteMeeting = function (id, userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var existingMeeting, canAccess;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.meeting.findUnique({ where: { id: id } })];
                    case 1:
                        existingMeeting = _a.sent();
                        if (!existingMeeting) {
                            throw new common_1.NotFoundException('Meeting not found');
                        }
                        return [4 /*yield*/, this.canAccessMeeting(id, userId, role)];
                    case 2:
                        canAccess = _a.sent();
                        if (!canAccess) {
                            throw new common_1.NotFoundException('Meeting not found or access denied');
                        }
                        return [4 /*yield*/, this.prisma.meeting["delete"]({ where: { id: id } })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Meeting deleted successfully'
                            }];
                }
            });
        });
    };
    MeetingsService = __decorate([
        common_1.Injectable()
    ], MeetingsService);
    return MeetingsService;
}());
exports.MeetingsService = MeetingsService;
