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
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var dbUser, convertBudget, budget, existingLead, leadData, inventory, lead;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // ✅ التحقق من المعطيات الأساسية
                        if (!userId) {
                            throw new common_1.BadRequestException('User ID is required to create a lead');
                        }
                        if (!email || !userRole) {
                            throw new common_1.ForbiddenException('Email and user role are required');
                        }
                        // ✅ التحقق من صلاحية الدور
                        if (!Object.values(roles_enum_1.Role).includes(userRole)) {
                            throw new common_1.ForbiddenException('Invalid user role');
                        }
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: userId },
                                select: { id: true, role: true, email: true }
                            })];
                    case 1:
                        dbUser = _e.sent();
                        if (!dbUser) {
                            throw new common_1.ForbiddenException('User not found in database');
                        }
                        if (dbUser.role !== userRole) {
                            throw new common_1.ForbiddenException('Role mismatch with database - potential security breach');
                        }
                        if (dbUser.email !== email) {
                            throw new common_1.ForbiddenException('Email mismatch with database - potential security breach');
                        }
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
                        budget = convertBudget(dto.budget);
                        if (budget < 0) {
                            throw new common_1.BadRequestException('Budget must be greater than or equal to 0');
                        }
                        if (!(dto.contact && dto.contact.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.lead.findFirst({
                                where: {
                                    OR: dto.contact.map(function (c) { return ({
                                        contact: { has: c }
                                    }); })
                                }
                            })];
                    case 2:
                        existingLead = _e.sent();
                        if (existingLead) {
                            throw new common_1.ConflictException('Lead with one of these contacts already exists');
                        }
                        _e.label = 3;
                    case 3:
                        leadData = {
                            nameEn: dto.nameEn,
                            nameAr: dto.nameAr,
                            familyName: dto.familyName,
                            contact: (_a = dto.contact) !== null && _a !== void 0 ? _a : [],
                            notes: dto.notes,
                            email: dto.email,
                            interest: dto.interest,
                            tier: dto.tier,
                            budget: budget,
                            source: dto.source,
                            status: dto.status,
                            owner: dto.assignedToId
                                ? { connect: { id: dto.assignedToId } }
                                : undefined
                        };
                        if (dto.lastCall) {
                            leadData.lastCall = new Date(dto.lastCall);
                        }
                        if (dto.firstConection) {
                            leadData.firstConection = new Date(dto.firstConection);
                        }
                        if (dto.lastVisit) {
                            leadData.lastVisit = new Date(dto.lastVisit);
                        }
                        if (!dto.inventoryInterestId) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.prisma.inventory.findUnique({
                                where: { id: dto.inventoryInterestId }
                            })];
                    case 4:
                        inventory = _e.sent();
                        if (!inventory) {
                            throw new common_1.NotFoundException('Inventory item not found');
                        }
                        leadData.inventoryInterest = {
                            connect: { id: dto.inventoryInterestId }
                        };
                        _e.label = 5;
                    case 5:
                        console.log("Data For Leads Create", leadData);
                        return [4 /*yield*/, this.prisma.lead.create({
                                data: leadData,
                                include: {
                                    inventoryInterest: true
                                }
                            })];
                    case 6:
                        lead = _e.sent();
                        return [2 /*return*/, {
                                status: 201,
                                message: 'Lead created successfully',
                                data: __assign(__assign({}, lead), { budget: (_c = (_b = lead.budget) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : null, inventory: (_d = lead.inventoryInterest) !== null && _d !== void 0 ? _d : null, properties: [] })
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        return __awaiter(this, void 0, void 0, function () {
            var dbUser, role, userId, lead, _2, teamMembers, allIds, convertBudget, updateData, limitedUpdate, budgetValue, updatedLead_1, assignedUser, inventory, updatedLead;
            return __generator(this, function (_3) {
                switch (_3.label) {
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
                        dbUser = _3.sent();
                        if (!dbUser)
                            throw new common_1.ForbiddenException('User not found in database');
                        if (dbUser.role !== userRole)
                            throw new common_1.ForbiddenException('Role mismatch with database');
                        if (dbUser.email !== email)
                            throw new common_1.ForbiddenException('Email mismatch with database');
                        role = user.role, userId = user.id;
                        _2 = role;
                        switch (_2) {
                            case roles_enum_1.Role.ADMIN: return [3 /*break*/, 2];
                            case roles_enum_1.Role.SALES_ADMIN: return [3 /*break*/, 2];
                            case roles_enum_1.Role.TEAM_LEADER: return [3 /*break*/, 4];
                            case roles_enum_1.Role.SALES_REP: return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 2: return [4 /*yield*/, this.prisma.lead.findUnique({ where: { id: leadId } })];
                    case 3:
                        lead = _3.sent();
                        return [3 /*break*/, 10];
                    case 4: return [4 /*yield*/, this.prisma.user.findMany({
                            where: { teamLeaderId: userId },
                            select: { id: true }
                        })];
                    case 5:
                        teamMembers = _3.sent();
                        allIds = __spreadArrays(teamMembers.map(function (m) { return m.id; }), [userId]);
                        return [4 /*yield*/, this.prisma.lead.findFirst({
                                where: { id: leadId, ownerId: { "in": allIds } }
                            })];
                    case 6:
                        lead = _3.sent();
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.prisma.lead.findFirst({
                            where: { id: leadId, ownerId: userId }
                        })];
                    case 8:
                        lead = _3.sent();
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
                                familyName: (_f = (_e = dto.familyName) !== null && _e !== void 0 ? _e : lead.familyName) !== null && _f !== void 0 ? _f : '',
                                firstConection: dto.firstConection ? new Date(dto.firstConection).toISOString() : lead.firstConection || null,
                                contact: (_h = (_g = dto.contact) !== null && _g !== void 0 ? _g : lead.contact) !== null && _h !== void 0 ? _h : [],
                                email: (_k = (_j = dto.email) !== null && _j !== void 0 ? _j : lead.email) !== null && _k !== void 0 ? _k : '',
                                interest: (_m = (_l = dto.interest) !== null && _l !== void 0 ? _l : lead.interest) !== null && _m !== void 0 ? _m : 'hot',
                                tier: (_p = (_o = dto.tier) !== null && _o !== void 0 ? _o : lead.tier) !== null && _p !== void 0 ? _p : 'bronze',
                                budget: dto.budget !== undefined ? convertBudget(dto.budget) : Number(lead.budget) || 0,
                                inventoryInterestId: (_r = (_q = dto.inventoryInterestId) !== null && _q !== void 0 ? _q : lead.inventoryInterestId) !== null && _r !== void 0 ? _r : null,
                                source: (_t = (_s = dto.source) !== null && _s !== void 0 ? _s : lead.source) !== null && _t !== void 0 ? _t : '',
                                status: dto.status || lead.status || 'fresh_lead',
                                ownerId: (_v = (_u = dto.assignedToId) !== null && _u !== void 0 ? _u : lead.ownerId) !== null && _v !== void 0 ? _v : null
                            };
                        }
                        else {
                            if (dto.nameEn === undefined && dto.nameAr === undefined && dto.inventoryInterestId === undefined) {
                                throw new common_1.ForbiddenException('You are only allowed to update the client name and the property they are interested in.');
                            }
                            updateData = {
                                nameEn: (_x = (_w = dto.nameEn) !== null && _w !== void 0 ? _w : lead.nameEn) !== null && _x !== void 0 ? _x : '',
                                nameAr: (_z = (_y = dto.nameAr) !== null && _y !== void 0 ? _y : lead.nameAr) !== null && _z !== void 0 ? _z : '',
                                inventoryInterestId: (_1 = (_0 = dto.inventoryInterestId) !== null && _0 !== void 0 ? _0 : lead.inventoryInterestId) !== null && _1 !== void 0 ? _1 : null
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
                        if (dto.contact !== undefined)
                            limitedUpdate.contact = dto.contact; // إضافة دعم المصفوفة
                        return [4 /*yield*/, this.prisma.lead.update({
                                where: { id: leadId },
                                data: limitedUpdate
                            })];
                    case 11:
                        updatedLead_1 = _3.sent();
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: userRole,
                                action: 'Sales Rep Update',
                                leadId: leadId,
                                description: "Sales rep : " + email + " updated lead: name=" + updatedLead_1.nameAr
                            })];
                    case 12:
                        _3.sent();
                        return [2 /*return*/, updatedLead_1];
                    case 13:
                        if (!updateData.ownerId) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: updateData.ownerId } })];
                    case 14:
                        assignedUser = _3.sent();
                        if (!assignedUser)
                            throw new common_1.NotFoundException('Assigned user Not Found');
                        _3.label = 15;
                    case 15:
                        if (!updateData.inventoryInterestId) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.prisma.inventory.findUnique({ where: { id: updateData.inventoryInterestId } })];
                    case 16:
                        inventory = _3.sent();
                        if (!inventory)
                            throw new common_1.NotFoundException('Inventory item not found');
                        _3.label = 17;
                    case 17: return [4 /*yield*/, this.prisma.lead.update({
                            where: { id: leadId },
                            data: __assign(__assign(__assign({ nameAr: updateData.nameAr, nameEn: updateData.nameEn, familyName: updateData.familyName, firstConection: updateData.firstConection, contact: updateData.contact, email: updateData.email, interest: updateData.interest, tier: updateData.tier, budget: updateData.budget, source: updateData.source, status: updateData.status, ownerId: updateData.ownerId, inventoryInterestId: updateData.inventoryInterestId }, (dto.notes !== undefined && { notes: dto.notes })), (dto.lastCall !== undefined && { lastCall: dto.lastCall })), (dto.lastVisit !== undefined && { lastVisit: dto.lastVisit }))
                        })];
                    case 18:
                        updatedLead = _3.sent();
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: userRole,
                                action: 'update_lead',
                                leadId: leadId,
                                description: "Updated lead: id=" + leadId + ", name=" + updateData.nameEn
                            })];
                    case 19:
                        _3.sent();
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
