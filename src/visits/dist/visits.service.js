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
exports.VisitsService = void 0;
var common_1 = require("@nestjs/common");
var VisitsService = /** @class */ (function () {
    function VisitsService(prisma, logsService) {
        this.prisma = prisma;
        this.logsService = logsService;
    }
    VisitsService.prototype.createVisit = function (dto, userId, leadId, email, role) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var lead, visit;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!userId || !leadId) {
                            throw new common_1.BadRequestException('Missing required fields');
                        }
                        return [4 /*yield*/, this.prisma.lead.findUnique({ where: { id: leadId } })];
                    case 1:
                        lead = _c.sent();
                        if (!lead)
                            throw new common_1.NotFoundException('Lead not found');
                        return [4 /*yield*/, this.prisma.visit.create({
                                data: {
                                    date: dto.date,
                                    notes: dto.notes,
                                    objections: dto.objections,
                                    createdById: userId,
                                    leadId: leadId,
                                    inventoryId: ((_a = dto.inventoryId) === null || _a === void 0 ? void 0 : _a.trim()) || undefined
                                },
                                include: {
                                    lead: true,
                                    inventory: true
                                }
                            })];
                    case 2:
                        visit = _c.sent();
                        // ⬇️ Create corresponding Meeting using shared visit info
                        return [4 /*yield*/, this.prisma.meeting.create({
                                data: {
                                    title: "Meeting for visit on " + dto.date,
                                    client: lead.nameEn || lead.nameAr || 'Unnamed Lead',
                                    date: dto.date,
                                    notes: dto.notes,
                                    objections: dto.objections,
                                    leadId: leadId,
                                    inventoryId: ((_b = dto.inventoryId) === null || _b === void 0 ? void 0 : _b.trim()) || undefined,
                                    createdById: userId,
                                    status: 'Scheduled',
                                    location: 'Client Location',
                                    locationType: 'visit'
                                }
                            })];
                    case 3:
                        // ⬇️ Create corresponding Meeting using shared visit info
                        _c.sent();
                        // Log creation
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: role,
                                action: 'create_visit',
                                description: "Visit for lead: name=" + lead.nameEn + ", contact=" + lead.contact + ", budget=" + lead.budget + ", status=" + lead.status + ", notes=" + (visit.notes || 'none') + ", objections=" + (visit.objections || 'none')
                            })];
                    case 4:
                        // Log creation
                        _c.sent();
                        return [2 /*return*/, { message: 'Visit created', data: visit }];
                }
            });
        });
    };
    VisitsService.prototype.getAllVisits = function (userId, userName, userRole, id) {
        return __awaiter(this, void 0, void 0, function () {
            var visits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.visit.findMany({
                            where: {
                                leadId: id
                            },
                            include: {
                                lead: true
                            },
                            orderBy: { createdAt: 'desc' }
                        })];
                    case 1:
                        visits = _a.sent();
                        return [2 /*return*/, { visits: visits }];
                }
            });
        });
    };
    VisitsService.prototype.deleteVisit = function (id, userId, userName, userRole) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var existingVisit, leadName;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.prisma.visit.findUnique({
                            where: { id: id },
                            include: {
                                lead: true
                            }
                        })];
                    case 1:
                        existingVisit = _b.sent();
                        if (!existingVisit)
                            throw new common_1.NotFoundException('Visit not found');
                        return [4 /*yield*/, this.prisma.visit["delete"]({ where: { id: id } })];
                    case 2:
                        _b.sent();
                        leadName = ((_a = existingVisit.lead) === null || _a === void 0 ? void 0 : _a.nameEn) || 'Unknown Lead';
                        // Log visit deletion
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                userName: userName,
                                userRole: userRole,
                                action: 'delete_visit',
                                description: "Deleted visit: id=" + id + ", lead=" + leadName
                            })];
                    case 3:
                        // Log visit deletion
                        _b.sent();
                        return [2 /*return*/, { message: 'Visit deleted successfully' }];
                }
            });
        });
    };
    VisitsService = __decorate([
        common_1.Injectable()
    ], VisitsService);
    return VisitsService;
}());
exports.VisitsService = VisitsService;
