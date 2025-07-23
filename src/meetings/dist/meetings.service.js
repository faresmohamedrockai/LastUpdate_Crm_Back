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
    function MeetingsService(prisma, logsService) {
        this.prisma = prisma;
        this.logsService = logsService;
    }
    MeetingsService.prototype.createMeeting = function (dto, userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var meeting;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.meeting.create({
                            data: __assign(__assign(__assign(__assign({ 
                                // الحقول الأساسية
                                title: dto.title, client: dto.client, date: dto.date ? dto.date : null, time: dto.time, duration: dto.duration, type: dto.type, status: dto.status, locationType: dto.locationType, notes: dto.notes, objections: dto.objections, location: dto.location }, (dto.inventoryId && {
                                inventory: {
                                    connect: { id: dto.inventoryId }
                                }
                            })), (dto.projectId && {
                                project: {
                                    connect: { id: dto.projectId }
                                }
                            })), (dto.assignedToId && {
                                assignedTo: {
                                    connect: { id: dto.assignedToId }
                                }
                            })), { 
                                // المستخدم المنشئ
                                createdBy: {
                                    connect: { id: userId }
                                } }),
                            include: {
                                lead: true,
                                inventory: true,
                                project: true,
                                assignedTo: true,
                                createdBy: true
                            }
                        })];
                    case 1:
                        meeting = _a.sent();
                        // // سجل عملية الإنشاء
                        // await this.logsService.createLog({
                        //   userId,
                        //   email,
                        //   userRole: role,
                        //   leadId: dto.leadId || null,
                        //   action: 'create_meeting',
                        //   description: `Created meeting: ${dto.title || ''} for lead ${dto.leadId || 'N/A'}`,
                        // });
                        return [2 /*return*/, {
                                status: 201,
                                message: 'Meeting created successfully',
                                meetings: meeting
                            }];
                }
            });
        });
    };
    MeetingsService.prototype.getAllMeetings = function (userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var meetings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.meeting.findMany({
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
                    case 1:
                        meetings = _a.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Meetings retrieved successfully',
                                meetings: meetings
                            }];
                }
            });
        });
    };
    MeetingsService.prototype.updateMeeting = function (id, dto, userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var existingMeeting, updatedMeeting, log;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.meeting.findUnique({
                            where: { id: id }
                        })];
                    case 1:
                        existingMeeting = _a.sent();
                        if (!existingMeeting) {
                            throw new common_1.NotFoundException('Meeting not found');
                        }
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
                    case 2:
                        updatedMeeting = _a.sent();
                        return [4 /*yield*/, this.prisma.log.create({
                                data: {
                                    user: {
                                        connect: {
                                            id: userId
                                        }
                                    },
                                    email: email,
                                    userRole: role,
                                    action: 'update_meeting',
                                    description: "Updated meeting : status=" + dto.status + ", date=" + dto.date
                                }
                            })];
                    case 3:
                        log = _a.sent();
                        // 4. الإرجاع
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Meeting updated successfully',
                                meetings: updatedMeeting
                            }];
                }
            });
        });
    };
    MeetingsService.prototype.deleteMeeting = function (id, userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var existingMeeting;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.meeting.findUnique({ where: { id: id } })];
                    case 1:
                        existingMeeting = _a.sent();
                        if (!existingMeeting) {
                            throw new common_1.NotFoundException('Meeting not found');
                        }
                        return [4 /*yield*/, this.prisma.meeting["delete"]({ where: { id: id } })];
                    case 2:
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
