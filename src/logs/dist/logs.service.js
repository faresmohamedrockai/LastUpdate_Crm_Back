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
exports.LogsService = void 0;
var common_1 = require("@nestjs/common");
var LogsService = /** @class */ (function () {
    function LogsService(prisma) {
        this.prisma = prisma;
    }
    /**
     * إنشاء Log جديد
     */
    LogsService.prototype.createLog = function (_a) {
        var userId = _a.userId, action = _a.action, leadId = _a.leadId, email = _a.email, description = _a.description, ip = _a.ip, userAgent = _a.userAgent, userName = _a.userName, userRole = _a.userRole;
        return __awaiter(this, void 0, void 0, function () {
            var logData, log;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logData = {
                            // user: { connect: { id: userId } },
                            userName: userName,
                            userRole: userRole,
                            action: action,
                            email: email,
                            description: description || ''
                        };
                        if (leadId) {
                            logData.leadId = leadId;
                        }
                        return [4 /*yield*/, this.prisma.log.create({
                                data: logData
                            })];
                    case 1:
                        log = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * جلب كل الـ Logs
     */
    LogsService.prototype.getAllLogs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var logs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.log.findMany({
                            orderBy: { createdAt: 'desc' }
                        })];
                    case 1:
                        logs = _a.sent();
                        return [2 /*return*/, logs.map(function (log) { return (__assign(__assign({}, log), { createdAt: log.createdAt.toISOString() })); })];
                }
            });
        });
    };
    /**
     * جلب كل الـ Logs لمستخدم معين
     */
    LogsService.prototype.getLogsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var logs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.log.findMany({
                            where: { userId: userId },
                            orderBy: { createdAt: 'desc' }
                        })];
                    case 1:
                        logs = _a.sent();
                        return [2 /*return*/, logs.map(function (log) { return (__assign(__assign({}, log), { createdAt: log.createdAt.toISOString() })); })];
                }
            });
        });
    };
    /**
     * جلب كل الـ Logs (لـ admin فقط)
     */
    LogsService.prototype.getLogsForAdmin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var logs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.log.findMany({
                            orderBy: { createdAt: 'desc' }
                        })];
                    case 1:
                        logs = _a.sent();
                        return [2 /*return*/, logs.map(function (log) { return (__assign(__assign({}, log), { createdAt: log.createdAt.toISOString() })); })];
                }
            });
        });
    };
    /**
     * جلب كل الـ Logs لكل أعضاء الشركة (sales_admin)
     */
    LogsService.prototype.getLogsForSalesAdmin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var teamLeaders, teamLeaderIds, teamMembers, memberIds, logs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { role: 'team_leader' },
                            select: { id: true }
                        })];
                    case 1:
                        teamLeaders = _a.sent();
                        teamLeaderIds = teamLeaders.map(function (u) { return u.id; });
                        return [4 /*yield*/, this.prisma.user.findMany({
                                where: { teamLeaderId: { "in": teamLeaderIds } },
                                select: { id: true }
                            })];
                    case 2:
                        teamMembers = _a.sent();
                        memberIds = teamMembers.map(function (u) { return u.id; });
                        return [4 /*yield*/, this.prisma.log.findMany({
                                where: {
                                    OR: [
                                        { userId: { "in": teamLeaderIds } },
                                        { userId: { "in": memberIds } },
                                    ]
                                },
                                orderBy: { createdAt: 'desc' }
                            })];
                    case 3:
                        logs = _a.sent();
                        return [2 /*return*/, logs.map(function (log) { return (__assign(__assign({}, log), { createdAt: log.createdAt.toISOString() })); })];
                }
            });
        });
    };
    /**
     * جلب كل الـ Logs لفريق معين (team_leader)
     */
    LogsService.prototype.getLogsForTeamLeader = function (teamLeaderId) {
        return __awaiter(this, void 0, void 0, function () {
            var teamMembers, memberIds, logs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { teamLeaderId: teamLeaderId },
                            select: { id: true }
                        })];
                    case 1:
                        teamMembers = _a.sent();
                        memberIds = teamMembers.map(function (u) { return u.id; });
                        return [4 /*yield*/, this.prisma.log.findMany({
                                where: {
                                    OR: [
                                        { userId: teamLeaderId },
                                        { userId: { "in": memberIds } },
                                    ]
                                },
                                orderBy: { createdAt: 'desc' }
                            })];
                    case 2:
                        logs = _a.sent();
                        return [2 /*return*/, logs.map(function (log) { return (__assign(__assign({}, log), { createdAt: log.createdAt.toISOString() })); })];
                }
            });
        });
    };
    LogsService = __decorate([
        common_1.Injectable()
    ], LogsService);
    return LogsService;
}());
exports.LogsService = LogsService;
