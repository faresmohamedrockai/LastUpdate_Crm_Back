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
exports.LeadsService = void 0;
var common_1 = require("@nestjs/common");
var roles_enum_1 = require("../auth/roles.enum");
var LeadsService = /** @class */ (function () {
    function LeadsService(prisma, configService, logsService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logsService = logsService;
    }
    LeadsService.prototype.create = function (dto, userId, email, userRole) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var existingLead, leadData, inventory, lead;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!userId) {
                            throw new common_1.BadRequestException('User ID is required to create a lead');
                        }
                        console.log(dto);
                        return [4 /*yield*/, this.prisma.lead.findUnique({
                                where: { contact: dto.contact }
                            })];
                    case 1:
                        existingLead = _b.sent();
                        if (existingLead) {
                            throw new common_1.ConflictException('Lead with this contact already exists');
                        }
                        leadData = {
                            nameEn: dto.nameEn,
                            nameAr: dto.nameAr,
                            contact: dto.contact,
                            notes: dto.notes,
                            budget: Number(dto.budget),
                            source: dto.source,
                            status: dto.status,
                            owner: {
                                connect: { id: dto.assignedToId }
                            }
                        };
                        if (dto.lastCall) {
                            leadData.lastCall = new Date(dto.lastCall);
                        }
                        if (dto.lastVisit) {
                            leadData.lastVisit = new Date(dto.lastVisit);
                        }
                        if (!dto.inventoryInterestId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.inventory.findUnique({
                                where: { id: dto.inventoryInterestId }
                            })];
                    case 2:
                        inventory = _b.sent();
                        if (!inventory) {
                            throw new common_1.NotFoundException('Inventory item not found');
                        }
                        leadData.inventoryInterest = {
                            connect: { id: dto.inventoryInterestId }
                        };
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this.prisma.lead.create({
                            data: leadData,
                            include: {
                                inventoryInterest: true
                            }
                        })];
                    case 4:
                        lead = _b.sent();
                        return [2 /*return*/, {
                                status: 201,
                                message: 'Lead created successfully',
                                data: __assign(__assign({}, lead), { inventory: (_a = lead.inventoryInterest) !== null && _a !== void 0 ? _a : null, properties: [] })
                            }];
                }
            });
        });
    };
    LeadsService.prototype.getLeads = function (id, email, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var leads, description, _a, teamMembers, memberIds;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = userRole;
                        switch (_a) {
                            case roles_enum_1.Role.ADMIN: return [3 /*break*/, 1];
                            case roles_enum_1.Role.SALES_ADMIN: return [3 /*break*/, 1];
                            case roles_enum_1.Role.TEAM_LEADER: return [3 /*break*/, 3];
                            case roles_enum_1.Role.SALES_REP: return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 1: return [4 /*yield*/, this.prisma.lead.findMany({
                            include: {
                                owner: true,
                                calls: true
                            }
                        })];
                    case 2:
                        leads = _b.sent();
                        description = "Admin retrieved " + leads.length + " leads";
                        return [3 /*break*/, 9];
                    case 3: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { teamLeaderId: id },
                            select: { id: true }
                        })];
                    case 4:
                        teamMembers = _b.sent();
                        memberIds = teamMembers.map(function (member) { return member.id; });
                        return [4 /*yield*/, this.prisma.lead.findMany({
                                where: { ownerId: { "in": memberIds } },
                                include: {
                                    owner: true,
                                    calls: true
                                }
                            })];
                    case 5:
                        leads = _b.sent();
                        description = "Team leader retrieved " + leads.length + " leads for team";
                        return [3 /*break*/, 9];
                    case 6: return [4 /*yield*/, this.prisma.lead.findMany({
                            where: { ownerId: id },
                            include: {
                                owner: true,
                                calls: true
                            }
                        })];
                    case 7:
                        leads = _b.sent();
                        description = "Sales rep retrieved " + leads.length + " leads";
                        return [3 /*break*/, 9];
                    case 8: throw new common_1.ForbiddenException('Access denied');
                    case 9: return [2 /*return*/, { leads: leads }];
                }
            });
        });
    };
    LeadsService.prototype.updateLead = function (leadId, dto, user, email, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var lead, role, userId, limitedUpdate, updatedLead_1, updatedLead;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.lead.findUnique({ where: { id: leadId } })];
                    case 1:
                        lead = _a.sent();
                        if (!lead)
                            throw new common_1.NotFoundException('Lead not found');
                        role = user.role, userId = user.id;
                        if (!(role === roles_enum_1.Role.SALES_REP)) return [3 /*break*/, 4];
                        if (lead.ownerId !== userId) {
                            throw new common_1.ForbiddenException('You can only edit your own leads');
                        }
                        limitedUpdate = __assign(__assign(__assign({}, (dto.status && { status: dto.status })), (dto.assignedToId && { ownerId: dto.assignedToId })), (dto.notes !== undefined && { notes: dto.notes }));
                        return [4 /*yield*/, this.prisma.lead.update({
                                where: { id: leadId },
                                data: limitedUpdate
                            })];
                    case 2:
                        updatedLead_1 = _a.sent();
                        // Log limited lead update
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: userRole,
                                action: 'update_lead_limited',
                                leadId: leadId,
                                description: "Sales rep updated lead: id=" + leadId + ", status=" + (dto.status || 'unchanged') + ", notes=" + (dto.notes ? 'updated' : 'unchanged')
                            })];
                    case 3:
                        // Log limited lead update
                        _a.sent();
                        return [2 /*return*/, updatedLead_1];
                    case 4: return [4 /*yield*/, this.prisma.lead.update({
                            where: { id: leadId },
                            data: {
                                nameAr: dto.nameAr,
                                nameEn: dto.nameEn,
                                contact: dto.contact,
                                budget: Number(dto.budget),
                                source: dto.source,
                                status: dto.status,
                                notes: dto.notes !== undefined ? dto.notes : undefined,
                                lastCall: dto.lastCall,
                                lastVisit: dto.lastVisit,
                                inventoryInterestId: dto.inventoryInterestId
                            }
                        })];
                    case 5:
                        updatedLead = _a.sent();
                        // Log full lead update
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: userRole,
                                action: 'update_lead',
                                // leadId: leadId,
                                description: "Updated lead: id=" + leadId + ", name=" + dto.nameEn + ", contact=" + dto.contact + ", status=" + dto.status
                            })];
                    case 6:
                        // Log full lead update
                        _a.sent();
                        return [2 /*return*/, updatedLead];
                }
            });
        });
    };
    LeadsService.prototype.deleteLead = function (leadId, userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var existingLead;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.lead.findUnique({
                            where: { id: leadId },
                            include: { calls: true, visits: true, meetings: true }
                        })];
                    case 1:
                        existingLead = _a.sent();
                        if (!existingLead) {
                            throw new common_1.NotFoundException('Lead not found');
                        }
                        // Check if lead has related data
                        if (existingLead.calls.length > 0 || existingLead.visits.length > 0 || existingLead.meetings.length > 0) {
                            throw new common_1.ConflictException('Cannot delete lead with existing calls, visits, or meetings');
                        }
                        return [4 /*yield*/, this.prisma.lead["delete"]({ where: { id: leadId } })];
                    case 2:
                        _a.sent();
                        // Log lead deletion
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: role,
                                action: 'delete_lead',
                                leadId: leadId,
                                description: "Deleted lead: id=" + leadId + ", name=" + existingLead.nameEn + ", contact=" + existingLead.contact
                            })];
                    case 3:
                        // Log lead deletion
                        _a.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Lead deleted successfully'
                            }];
                }
            });
        });
    };
    LeadsService = __decorate([
        common_1.Injectable()
    ], LeadsService);
    return LeadsService;
}());
exports.LeadsService = LeadsService;
