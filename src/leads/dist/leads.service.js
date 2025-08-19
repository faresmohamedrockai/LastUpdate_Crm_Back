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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
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
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var dbUser, convertBudget, budget, existingLead, existingLead, leadData, inventory, project, lead;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        // ✅ التحقق من المعطيات الأساسية
                        if (!userId)
                            throw new common_1.BadRequestException('User ID is required to create a lead');
                        if (!email || !userRole)
                            throw new common_1.ForbiddenException('Email and user role are required');
                        // ✅ التحقق من صلاحية الدور
                        if (!Object.values(roles_enum_1.Role).includes(userRole)) {
                            throw new common_1.ForbiddenException('Invalid user role');
                        }
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: userId },
                                select: { id: true, role: true, email: true }
                            })];
                    case 1:
                        dbUser = _g.sent();
                        if (!dbUser)
                            throw new common_1.ForbiddenException('User not found in database');
                        if (dbUser.role !== userRole)
                            throw new common_1.ForbiddenException('Role mismatch');
                        if (dbUser.email !== email)
                            throw new common_1.ForbiddenException('Email mismatch');
                        convertBudget = function (value) {
                            if (value === undefined || value === null || value === '')
                                return 0;
                            if (typeof value === 'number')
                                return value;
                            var parsed = parseFloat(value);
                            return isNaN(parsed) ? 0 : parsed;
                        };
                        budget = convertBudget(dto.budget);
                        if (budget < 0)
                            throw new common_1.BadRequestException('Budget must be >= 0');
                        if (!(dto.contacts && dto.contacts.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.lead.findFirst({
                                where: {
                                    OR: dto.contacts.map(function (c) { return ({
                                        contacts: { has: c } // لو contact في DB عبارة عن array
                                    }); })
                                }
                            })];
                    case 2:
                        existingLead = _g.sent();
                        if (existingLead)
                            throw new common_1.ConflictException('Lead with one of these contacts already exists');
                        _g.label = 3;
                    case 3:
                        if (!dto.contact) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.prisma.lead.findFirst({
                                where: {
                                    contact: dto.contact
                                }
                            })];
                    case 4:
                        existingLead = _g.sent();
                        if (existingLead)
                            throw new common_1.ConflictException('Lead with this contact already exists');
                        _g.label = 5;
                    case 5:
                        leadData = {
                            nameEn: dto.nameEn,
                            nameAr: dto.nameAr,
                            description: dto.description,
                            otherProject: dto.otherProject,
                            familyName: dto.familyName,
                            contact: (_a = dto.contact) !== null && _a !== void 0 ? _a : '',
                            contacts: (_b = dto.contacts) !== null && _b !== void 0 ? _b : [],
                            notes: dto.notes,
                            email: dto.email,
                            cil: dto.cil,
                            interest: dto.interest,
                            tier: dto.tier,
                            budget: budget,
                            source: dto.source,
                            status: dto.status,
                            owner: dto.assignedToId ? { connect: { id: dto.assignedToId } } : undefined
                        };
                        if (dto.lastCall)
                            leadData.lastCall = new Date(dto.lastCall);
                        if (dto.firstConection)
                            leadData.firstConection = new Date(dto.firstConection);
                        if (dto.lastVisit)
                            leadData.lastVisit = new Date(dto.lastVisit);
                        if (!dto.inventoryInterestId) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.prisma.inventory.findUnique({ where: { id: dto.inventoryInterestId } })];
                    case 6:
                        inventory = _g.sent();
                        if (!inventory)
                            throw new common_1.NotFoundException('Inventory item not found');
                        leadData.inventoryInterest = { connect: { id: dto.inventoryInterestId } };
                        _g.label = 7;
                    case 7:
                        if (!dto.projectInterestId) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: dto.projectInterestId } })];
                    case 8:
                        project = _g.sent();
                        if (!project)
                            throw new common_1.NotFoundException('Project not found');
                        leadData.projectInterest = { connect: { id: dto.projectInterestId } };
                        _g.label = 9;
                    case 9:
                        console.log("Data For Leads Create", leadData);
                        return [4 /*yield*/, this.prisma.lead.create({
                                data: leadData,
                                include: { inventoryInterest: true, projectInterest: true }
                            })];
                    case 10:
                        lead = _g.sent();
                        return [2 /*return*/, {
                                status: 201,
                                message: 'Lead created successfully',
                                data: __assign(__assign({}, lead), { budget: (_d = (_c = lead.budget) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : null, inventory: (_e = lead.inventoryInterest) !== null && _e !== void 0 ? _e : null, projectInterest: (_f = lead.projectInterest) !== null && _f !== void 0 ? _f : null, properties: [] })
                            }];
                }
            });
        });
    };
    LeadsService.prototype.getLeads = function (id, email, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var user, leads, description, _a, teamMembers, memberIds, allIds, parsedLeads;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // 🔒 SECURITY FIX: Validate userRole parameter
                        if (!userRole) {
                            throw new common_1.ForbiddenException('User role is required');
                        }
                        // Validate that the role is a valid enum value
                        if (!Object.values(roles_enum_1.Role).includes(userRole)) {
                            throw new common_1.ForbiddenException('Invalid user role');
                        }
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: id },
                                select: { id: true, role: true, email: true }
                            })];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            throw new common_1.ForbiddenException('User not found');
                        }
                        if (user.role !== userRole) {
                            throw new common_1.ForbiddenException('Role mismatch - potential security breach');
                        }
                        if (user.email !== email) {
                            throw new common_1.ForbiddenException('Email mismatch - potential security breach');
                        }
                        _a = userRole;
                        switch (_a) {
                            case roles_enum_1.Role.ADMIN: return [3 /*break*/, 2];
                            case roles_enum_1.Role.SALES_ADMIN: return [3 /*break*/, 2];
                            case roles_enum_1.Role.TEAM_LEADER: return [3 /*break*/, 4];
                            case roles_enum_1.Role.SALES_REP: return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 2: return [4 /*yield*/, this.prisma.lead.findMany({
                            include: {
                                owner: true,
                                calls: true,
                                inventoryInterest: {
                                    include: { project: true }
                                },
                                projectInterest: true,
                                meetings: {
                                    include: {
                                        createdBy: true,
                                        assignedTo: true,
                                        project: true,
                                        inventory: true
                                    }
                                }
                            }
                        })];
                    case 3:
                        leads = _b.sent();
                        description = "Admin retrieved " + leads.length + " leads with meetings";
                        description = "Admin retrieved " + leads.length + " leads";
                        return [3 /*break*/, 10];
                    case 4: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { teamLeaderId: id },
                            select: { id: true }
                        })];
                    case 5:
                        teamMembers = _b.sent();
                        memberIds = teamMembers.map(function (member) { return member.id; });
                        allIds = __spreadArrays(memberIds, [id]).filter(function (id) { return id !== undefined && id !== null; });
                        return [4 /*yield*/, this.prisma.lead.findMany({
                                where: { ownerId: { "in": allIds } },
                                include: {
                                    owner: true,
                                    inventoryInterest: {
                                        include: {
                                            project: {
                                                select: {
                                                    nameEn: true,
                                                    nameAr: true
                                                }
                                            }
                                        }
                                    },
                                    calls: true
                                }
                            })];
                    case 6:
                        leads = _b.sent();
                        description = "Team leader retrieved " + leads.length + " leads for team and self";
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.prisma.lead.findMany({
                            where: { ownerId: id },
                            include: {
                                owner: true,
                                calls: true
                            }
                        })];
                    case 8:
                        leads = _b.sent();
                        description = "Sales rep retrieved " + leads.length + " leads";
                        return [3 /*break*/, 10];
                    case 9: throw new common_1.ForbiddenException('Access denied');
                    case 10:
                        parsedLeads = leads.map(function (lead) {
                            var _a, _b, _c, _d;
                            return (__assign(__assign({}, lead), { createdAt: lead.createdAt ? (_a = lead.createdAt) === null || _a === void 0 ? void 0 : _a.toLocaleDateString('en-GB') : null, firstConection: lead.firstConection ? lead.firstConection.toLocaleDateString('en-GB') : null, owner: lead.owner
                                    ? __assign(__assign({}, lead.owner), { createdAt: (_c = (_b = lead.owner.createdAt) === null || _b === void 0 ? void 0 : _b.toISOString) === null || _c === void 0 ? void 0 : _c.call(_b) }) : null, calls: ((_d = lead.calls) === null || _d === void 0 ? void 0 : _d.map(function (call) {
                                    var _a;
                                    return (__assign(__assign({}, call), { createdAt: call.createdAt ? (_a = call.createdAt) === null || _a === void 0 ? void 0 : _a.toLocaleDateString('en-GB') : null }));
                                })) || [] }));
                        });
                        return [2 /*return*/, { leads: parsedLeads }];
                }
            });
        });
    };
    LeadsService.prototype.getLeadsByOwnerId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var leads, parsedLeads;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.lead.findMany({
                            where: { ownerId: userId },
                            include: {
                                owner: true,
                                calls: true,
                                inventoryInterest: true
                            }
                        })];
                    case 1:
                        leads = _a.sent();
                        parsedLeads = leads.map(function (lead) {
                            var _a, _b, _c, _d;
                            return (__assign(__assign({}, lead), { createdAt: (_a = lead.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString(), owner: lead.owner
                                    ? __assign(__assign({}, lead.owner), { createdAt: (_c = (_b = lead.owner.createdAt) === null || _b === void 0 ? void 0 : _b.toISOString) === null || _c === void 0 ? void 0 : _c.call(_b) }) : null, calls: ((_d = lead.calls) === null || _d === void 0 ? void 0 : _d.map(function (call) {
                                    var _a, _b;
                                    return (__assign(__assign({}, call), { createdAt: (_b = (_a = call.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString) === null || _b === void 0 ? void 0 : _b.call(_a) }));
                                })) || [] }));
                        });
                        return [2 /*return*/, { leads: parsedLeads }];
                }
            });
        });
    };
    LeadsService.prototype.getLeadById = function (leadId, user) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var dbUser, role, userId, lead, _b, teamMembers, memberIds, allIds;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // 🔒 SECURITY FIX: Validate parameters
                        if (!user || !user.id || !user.role) {
                            throw new common_1.ForbiddenException('Valid user object with id and role is required');
                        }
                        // Validate that the role is a valid enum value
                        if (!Object.values(roles_enum_1.Role).includes(user.role)) {
                            throw new common_1.ForbiddenException('Invalid user role');
                        }
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: user.id },
                                select: { id: true, role: true, email: true }
                            })];
                    case 1:
                        dbUser = _c.sent();
                        if (!dbUser) {
                            throw new common_1.ForbiddenException('User not found in database');
                        }
                        if (dbUser.role !== user.role) {
                            throw new common_1.ForbiddenException('Role mismatch with database - potential security breach');
                        }
                        role = user.role, userId = user.id;
                        _b = role;
                        switch (_b) {
                            case roles_enum_1.Role.ADMIN: return [3 /*break*/, 2];
                            case roles_enum_1.Role.SALES_ADMIN: return [3 /*break*/, 2];
                            case roles_enum_1.Role.TEAM_LEADER: return [3 /*break*/, 4];
                            case roles_enum_1.Role.SALES_REP: return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 2: return [4 /*yield*/, this.prisma.lead.findUnique({
                            where: { id: leadId },
                            include: {
                                owner: {
                                    select: { id: true, name: true, email: true }
                                },
                                inventoryInterest: {
                                    select: { id: true, title: true, titleEn: true, titleAr: true }
                                }
                            }
                        })];
                    case 3:
                        // Admins can access any lead
                        lead = _c.sent();
                        return [3 /*break*/, 10];
                    case 4: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { teamLeaderId: userId },
                            select: { id: true }
                        })];
                    case 5:
                        teamMembers = _c.sent();
                        memberIds = teamMembers.map(function (member) { return member.id; });
                        allIds = __spreadArrays(memberIds, [userId]);
                        return [4 /*yield*/, this.prisma.lead.findFirst({
                                where: {
                                    id: leadId,
                                    ownerId: { "in": allIds }
                                },
                                include: {
                                    owner: {
                                        select: { id: true, name: true, email: true }
                                    },
                                    inventoryInterest: {
                                        select: { id: true, title: true, titleEn: true, titleAr: true }
                                    }
                                }
                            })];
                    case 6:
                        lead = _c.sent();
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.prisma.lead.findFirst({
                            where: {
                                id: leadId,
                                ownerId: userId
                            },
                            include: {
                                owner: {
                                    select: { id: true, name: true, email: true }
                                },
                                inventoryInterest: {
                                    select: { id: true, title: true, titleEn: true, titleAr: true }
                                }
                            }
                        })];
                    case 8:
                        // Sales reps can only access their own leads
                        lead = _c.sent();
                        return [3 /*break*/, 10];
                    case 9: throw new common_1.ForbiddenException('Access denied');
                    case 10:
                        if (!lead) {
                            throw new common_1.NotFoundException('Lead not found or access denied');
                        }
                        // Return data in the format expected by the form
                        return [2 /*return*/, {
                                id: lead.id,
                                nameEn: lead.nameEn || '',
                                nameAr: lead.nameAr || '',
                                contact: lead.contact || '',
                                firstConection: lead.firstConection || '',
                                email: lead.email || '',
                                budget: Number(lead.budget) || 0,
                                inventoryInterestId: lead.inventoryInterestId || '',
                                source: lead.source || '',
                                status: lead.status || 'fresh_lead',
                                assignedToId: lead.ownerId || '',
                                // Additional fields
                                notes: lead.notes || [],
                                lastCall: lead.lastCall,
                                lastVisit: lead.lastVisit,
                                createdAt: (_a = lead.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                                // Include related data for reference
                                owner: lead.owner,
                                inventoryInterest: lead.inventoryInterest
                            }];
                }
            });
        });
    };
    LeadsService.prototype.updateLead = function (leadId, dto, user, email, userRole) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25;
        return __awaiter(this, void 0, void 0, function () {
            var dbUser, role, userId, lead, _26, teamMembers, allIds, convertBudget, updateData, limitedUpdate, budgetValue, updatedLead_1, assignedUser, inventory, updatedLead;
            return __generator(this, function (_27) {
                switch (_27.label) {
                    case 0:
                        if (!email || !userRole)
                            throw new common_1.ForbiddenException('Email and user role are required');
                        if (!Object.values(roles_enum_1.Role).includes(userRole))
                            throw new common_1.ForbiddenException('Invalid user role');
                        if (user.role !== userRole)
                            throw new common_1.ForbiddenException('User role mismatch');
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: user.id },
                                select: { id: true, role: true, email: true }
                            })];
                    case 1:
                        dbUser = _27.sent();
                        if (!dbUser)
                            throw new common_1.ForbiddenException('User not found in database');
                        if (dbUser.role !== userRole)
                            throw new common_1.ForbiddenException('Role mismatch with database');
                        if (dbUser.email !== email)
                            throw new common_1.ForbiddenException('Email mismatch with database');
                        role = user.role, userId = user.id;
                        _26 = role;
                        switch (_26) {
                            case roles_enum_1.Role.ADMIN: return [3 /*break*/, 2];
                            case roles_enum_1.Role.SALES_ADMIN: return [3 /*break*/, 2];
                            case roles_enum_1.Role.TEAM_LEADER: return [3 /*break*/, 4];
                            case roles_enum_1.Role.SALES_REP: return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 2: return [4 /*yield*/, this.prisma.lead.findUnique({ where: { id: leadId } })];
                    case 3:
                        lead = _27.sent();
                        return [3 /*break*/, 10];
                    case 4: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { teamLeaderId: userId },
                            select: { id: true }
                        })];
                    case 5:
                        teamMembers = _27.sent();
                        allIds = __spreadArrays(teamMembers.map(function (m) { return m.id; }), [userId]);
                        return [4 /*yield*/, this.prisma.lead.findFirst({
                                where: { id: leadId, ownerId: { "in": allIds } }
                            })];
                    case 6:
                        lead = _27.sent();
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.prisma.lead.findFirst({
                            where: { id: leadId, ownerId: userId }
                        })];
                    case 8:
                        lead = _27.sent();
                        return [3 /*break*/, 10];
                    case 9: throw new common_1.ForbiddenException('Access denied');
                    case 10:
                        if (!lead)
                            throw new common_1.NotFoundException('Lead not found or access denied');
                        convertBudget = function (value) {
                            if (value === undefined || value === null || value === '')
                                return 0;
                            if (typeof value === 'number')
                                return value;
                            if (typeof value === 'string') {
                                var parsed = parseFloat(value);
                                return isNaN(parsed) ? 0 : parsed;
                            }
                            return 0;
                        };
                        if (["admin", "sales_admin", "team_leader"].includes(userRole)) {
                            updateData = {
                                nameEn: (_b = (_a = dto.nameEn) !== null && _a !== void 0 ? _a : lead.nameEn) !== null && _b !== void 0 ? _b : '',
                                nameAr: (_d = (_c = dto.nameAr) !== null && _c !== void 0 ? _c : lead.nameAr) !== null && _d !== void 0 ? _d : '',
                                description: (_f = (_e = dto.description) !== null && _e !== void 0 ? _e : lead.description) !== null && _f !== void 0 ? _f : '',
                                otherProject: (_h = (_g = dto.otherProject) !== null && _g !== void 0 ? _g : lead.otherProject) !== null && _h !== void 0 ? _h : '',
                                familyName: (_k = (_j = dto.familyName) !== null && _j !== void 0 ? _j : lead.familyName) !== null && _k !== void 0 ? _k : '',
                                firstConection: dto.firstConection ? new Date(dto.firstConection) : lead.firstConection,
                                contact: (_m = (_l = dto.contact) !== null && _l !== void 0 ? _l : lead.contact) !== null && _m !== void 0 ? _m : '',
                                contacts: (_p = (_o = dto.contacts) !== null && _o !== void 0 ? _o : lead.contacts) !== null && _p !== void 0 ? _p : [],
                                email: (_r = (_q = dto.email) !== null && _q !== void 0 ? _q : lead.email) !== null && _r !== void 0 ? _r : '',
                                cil: (_t = (_s = dto.cil) !== null && _s !== void 0 ? _s : lead.cil) !== null && _t !== void 0 ? _t : false,
                                interest: (_v = (_u = dto.interest) !== null && _u !== void 0 ? _u : lead.interest) !== null && _v !== void 0 ? _v : 'hot',
                                tier: (_x = (_w = dto.tier) !== null && _w !== void 0 ? _w : lead.tier) !== null && _x !== void 0 ? _x : 'bronze',
                                budget: dto.budget !== undefined ? convertBudget(dto.budget) : Number(lead.budget) || 0,
                                inventoryInterestId: (_z = (_y = dto.inventoryInterestId) !== null && _y !== void 0 ? _y : lead.inventoryInterestId) !== null && _z !== void 0 ? _z : null,
                                projectInterestId: (_1 = (_0 = dto.projectInterestId) !== null && _0 !== void 0 ? _0 : lead.projectInterestId) !== null && _1 !== void 0 ? _1 : null,
                                source: (_3 = (_2 = dto.source) !== null && _2 !== void 0 ? _2 : lead.source) !== null && _3 !== void 0 ? _3 : '',
                                status: dto.status || lead.status || 'fresh_lead',
                                ownerId: (_5 = (_4 = dto.assignedToId) !== null && _4 !== void 0 ? _4 : lead.ownerId) !== null && _5 !== void 0 ? _5 : null
                            };
                        }
                        else {
                            // updates for sales rep
                            if (dto.nameEn === undefined && dto.nameAr === undefined && dto.inventoryInterestId === undefined) {
                                throw new common_1.ForbiddenException('You are only allowed to update the client name and the property they are interested in.');
                            }
                            updateData = {
                                nameEn: (_7 = (_6 = dto.nameEn) !== null && _6 !== void 0 ? _6 : lead.nameEn) !== null && _7 !== void 0 ? _7 : '',
                                nameAr: (_9 = (_8 = dto.nameAr) !== null && _8 !== void 0 ? _8 : lead.nameAr) !== null && _9 !== void 0 ? _9 : '',
                                familyName: (_11 = (_10 = dto.familyName) !== null && _10 !== void 0 ? _10 : lead.familyName) !== null && _11 !== void 0 ? _11 : '',
                                description: (_13 = (_12 = dto.description) !== null && _12 !== void 0 ? _12 : lead.description) !== null && _13 !== void 0 ? _13 : '',
                                cil: (_15 = (_14 = dto.cil) !== null && _14 !== void 0 ? _14 : lead.cil) !== null && _15 !== void 0 ? _15 : false,
                                projectInterestId: (_17 = (_16 = dto.projectInterestId) !== null && _16 !== void 0 ? _16 : lead.projectInterestId) !== null && _17 !== void 0 ? _17 : null,
                                otherProject: (_19 = (_18 = dto.otherProject) !== null && _18 !== void 0 ? _18 : lead.otherProject) !== null && _19 !== void 0 ? _19 : ''
                            };
                        }
                        if (updateData.budget < 0)
                            throw new common_1.BadRequestException('Budget must be >= 0');
                        if (!(role === roles_enum_1.Role.SALES_REP)) return [3 /*break*/, 13];
                        if (lead.ownerId !== userId)
                            throw new common_1.ForbiddenException('You can only edit your own leads');
                        limitedUpdate = {};
                        if (dto.nameAr !== undefined)
                            limitedUpdate.nameAr = dto.nameAr;
                        if (dto.nameEn !== undefined)
                            limitedUpdate.nameEn = dto.nameEn;
                        if (dto.description !== undefined)
                            limitedUpdate.description = dto.description;
                        if (dto.cil !== undefined)
                            limitedUpdate.cil = dto.cil;
                        if (dto.otherProject !== undefined)
                            limitedUpdate.otherProject = dto.otherProject;
                        if (dto.familyName !== undefined)
                            limitedUpdate.familyName = dto.familyName;
                        if (dto.status !== undefined)
                            limitedUpdate.status = dto.status || lead.status || 'fresh_lead';
                        if (dto.notes !== undefined)
                            limitedUpdate.notes = dto.notes;
                        if (dto.budget !== undefined) {
                            budgetValue = convertBudget(dto.budget);
                            if (budgetValue < 0)
                                throw new common_1.BadRequestException('Budget must be >= 0');
                            limitedUpdate.budget = budgetValue;
                        }
                        if (dto.inventoryInterestId !== undefined)
                            limitedUpdate.inventoryInterestId = dto.inventoryInterestId || null;
                        if (dto.projectInterestId !== undefined)
                            limitedUpdate.projectInterestId = dto.projectInterestId || null;
                        if (dto.contact !== undefined)
                            limitedUpdate.contact = dto.contact; // string
                        if (dto.contacts !== undefined)
                            limitedUpdate.contacts = dto.contacts; // array
                        if (dto.firstConection)
                            limitedUpdate.firstConection = new Date(dto.firstConection);
                        console.log("Updated Data Will Send sales rep", updateData);
                        return [4 /*yield*/, this.prisma.lead.update({
                                where: { id: leadId },
                                data: limitedUpdate
                            })];
                    case 11:
                        updatedLead_1 = _27.sent();
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: userRole,
                                action: 'Sales Rep Update',
                                leadId: leadId,
                                description: "Sales rep : " + email + " updated lead: name=" + updatedLead_1.nameAr
                            })];
                    case 12:
                        _27.sent();
                        return [2 /*return*/, updatedLead_1];
                    case 13:
                        if (!updateData.ownerId) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: updateData.ownerId } })];
                    case 14:
                        assignedUser = _27.sent();
                        if (!assignedUser)
                            throw new common_1.NotFoundException('Assigned user Not Found');
                        _27.label = 15;
                    case 15:
                        if (!updateData.inventoryInterestId) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.prisma.inventory.findUnique({ where: { id: updateData.inventoryInterestId } })];
                    case 16:
                        inventory = _27.sent();
                        if (!inventory)
                            throw new common_1.NotFoundException('Inventory item not found');
                        _27.label = 17;
                    case 17:
                        console.log("Updated Data Will Send", updateData);
                        return [4 /*yield*/, this.prisma.lead.update({
                                where: { id: leadId },
                                data: __assign(__assign(__assign({ nameAr: updateData.nameAr, nameEn: updateData.nameEn, description: updateData.description, familyName: updateData.familyName, firstConection: updateData.firstConection, contact: (_21 = (_20 = dto.contact) !== null && _20 !== void 0 ? _20 : lead.contact) !== null && _21 !== void 0 ? _21 : '', contacts: (_23 = (_22 = dto.contacts) !== null && _22 !== void 0 ? _22 : lead.contacts) !== null && _23 !== void 0 ? _23 : [], cil: (_25 = (_24 = dto.cil) !== null && _24 !== void 0 ? _24 : lead.cil) !== null && _25 !== void 0 ? _25 : false, email: updateData.email, otherProject: updateData.otherProject, interest: updateData.interest, tier: updateData.tier, budget: updateData.budget, source: updateData.source, status: updateData.status, ownerId: updateData.ownerId, inventoryInterestId: updateData.inventoryInterestId, projectInterestId: updateData.projectInterestId }, (dto.notes !== undefined && { notes: dto.notes })), (dto.lastCall !== undefined && { lastCall: dto.lastCall })), (dto.lastVisit !== undefined && { lastVisit: dto.lastVisit }))
                            })];
                    case 18:
                        updatedLead = _27.sent();
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: userRole,
                                action: 'update_lead',
                                leadId: leadId,
                                description: "Updated lead: id=" + leadId + ", name=" + updateData.nameEn
                            })];
                    case 19:
                        _27.sent();
                        return [2 /*return*/, updatedLead];
                }
            });
        });
    };
    LeadsService.prototype.deleteLead = function (leadId, userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var dbUser, existingLead, _a, teamMembers, memberIds, allIds, _b, teamMembers, memberIds, allIds;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // 🔒 SECURITY FIX: Validate parameters
                        if (!userId || !email || !role) {
                            throw new common_1.ForbiddenException('User ID, email, and role are required');
                        }
                        // Validate that the role is a valid enum value
                        if (!Object.values(roles_enum_1.Role).includes(role)) {
                            throw new common_1.ForbiddenException('Invalid user role');
                        }
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: userId },
                                select: { id: true, role: true, email: true }
                            })];
                    case 1:
                        dbUser = _c.sent();
                        if (!dbUser) {
                            throw new common_1.ForbiddenException('User not found in database');
                        }
                        if (dbUser.role !== role) {
                            throw new common_1.ForbiddenException('Role mismatch with database - potential security breach');
                        }
                        if (dbUser.email !== email) {
                            throw new common_1.ForbiddenException('Email mismatch with database - potential security breach');
                        }
                        _a = role;
                        switch (_a) {
                            case roles_enum_1.Role.ADMIN: return [3 /*break*/, 2];
                            case roles_enum_1.Role.SALES_ADMIN: return [3 /*break*/, 2];
                            case roles_enum_1.Role.TEAM_LEADER: return [3 /*break*/, 4];
                            case roles_enum_1.Role.SALES_REP: return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 2: return [4 /*yield*/, this.prisma.lead.findUnique({
                            where: { id: leadId },
                            include: { calls: true, visits: true, meetings: true }
                        })];
                    case 3:
                        // Admins can access any lead
                        existingLead = _c.sent();
                        return [3 /*break*/, 10];
                    case 4: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { teamLeaderId: userId },
                            select: { id: true }
                        })];
                    case 5:
                        teamMembers = _c.sent();
                        memberIds = teamMembers.map(function (member) { return member.id; });
                        allIds = __spreadArrays(memberIds, [userId]);
                        return [4 /*yield*/, this.prisma.lead.findFirst({
                                where: {
                                    id: leadId,
                                    ownerId: { "in": allIds }
                                },
                                include: { calls: true, visits: true, meetings: true }
                            })];
                    case 6:
                        existingLead = _c.sent();
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.prisma.lead.findFirst({
                            where: {
                                id: leadId,
                                ownerId: userId
                            },
                            include: { calls: true, visits: true, meetings: true }
                        })];
                    case 8:
                        // Sales reps can only access their own leads
                        existingLead = _c.sent();
                        return [3 /*break*/, 10];
                    case 9: throw new common_1.ForbiddenException('Access denied');
                    case 10:
                        if (!existingLead) {
                            throw new common_1.NotFoundException('Lead not found or access denied');
                        }
                        _b = role;
                        switch (_b) {
                            case roles_enum_1.Role.ADMIN: return [3 /*break*/, 11];
                            case roles_enum_1.Role.SALES_ADMIN: return [3 /*break*/, 11];
                            case roles_enum_1.Role.TEAM_LEADER: return [3 /*break*/, 12];
                            case roles_enum_1.Role.SALES_REP: return [3 /*break*/, 14];
                        }
                        return [3 /*break*/, 15];
                    case 11: 
                    // Admins can delete any lead
                    return [3 /*break*/, 16];
                    case 12: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { teamLeaderId: userId },
                            select: { id: true }
                        })];
                    case 13:
                        teamMembers = _c.sent();
                        memberIds = teamMembers.map(function (member) { return member.id; });
                        allIds = __spreadArrays(memberIds, [userId]);
                        if (existingLead.ownerId && !allIds.includes(existingLead.ownerId)) {
                            throw new common_1.ForbiddenException('You can only delete leads owned by you or your team members');
                        }
                        return [3 /*break*/, 16];
                    case 14:
                        // Sales reps can only delete their own leads
                        if (existingLead.ownerId !== userId) {
                            throw new common_1.ForbiddenException('You can only delete your own leads');
                        }
                        return [3 /*break*/, 16];
                    case 15: throw new common_1.ForbiddenException('Access denied');
                    case 16:
                        // Check if lead has related data
                        if (existingLead.calls.length > 0 || existingLead.visits.length > 0 || existingLead.meetings.length > 0) {
                            throw new common_1.ConflictException('Cannot delete lead with existing calls, visits, or meetings');
                        }
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: role,
                                action: 'delete_lead',
                                leadId: leadId,
                                description: "Deleted lead: id=" + leadId + ", name=" + existingLead.nameEn + ", contact=" + existingLead.contact
                            })];
                    case 17:
                        _c.sent();
                        return [4 /*yield*/, this.prisma.lead["delete"]({ where: { id: leadId } })];
                    case 18:
                        _c.sent();
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
