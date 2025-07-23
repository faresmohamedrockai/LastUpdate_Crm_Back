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
exports.ProjectsService = void 0;
var common_1 = require("@nestjs/common");
var ProjectsService = /** @class */ (function () {
    function ProjectsService(prisma, cloudinaryservice, logsService) {
        this.prisma = prisma;
        this.cloudinaryservice = cloudinaryservice;
        this.logsService = logsService;
    }
    ProjectsService.prototype.createProject = function (dto, email, userRole) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function () {
            var developer, zone, existingProject, uploadedImages, project, _i, _h, plan;
            var _this = this;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (!dto.developerId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.prisma.developer.findUnique({
                                where: { id: dto.developerId }
                            })];
                    case 1:
                        developer = _j.sent();
                        if (!developer) {
                            throw new common_1.NotFoundException('Developer not found');
                        }
                        _j.label = 2;
                    case 2:
                        if (!dto.zoneId) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.prisma.zone.findUnique({
                                where: { id: dto.zoneId }
                            })];
                    case 3:
                        zone = _j.sent();
                        if (!zone) {
                            throw new common_1.NotFoundException('Zone not found');
                        }
                        _j.label = 4;
                    case 4: return [4 /*yield*/, this.prisma.project.findFirst({
                            where: { nameEn: dto.nameEn }
                        })];
                    case 5:
                        existingProject = _j.sent();
                        if (existingProject) {
                            throw new common_1.ConflictException('Project with this name already exists');
                        }
                        uploadedImages = [];
                        if (!(dto.images && dto.images.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, Promise.all(dto.images.map(function (base64, index) {
                                return _this.cloudinaryservice.uploadImageFromBase64(base64, 'projects', "project_" + Date.now() + "_" + index);
                            }))];
                    case 6:
                        uploadedImages = _j.sent();
                        _j.label = 7;
                    case 7: return [4 /*yield*/, this.prisma.project.create({
                            data: {
                                nameEn: dto.nameEn,
                                nameAr: (_a = dto.nameAr) !== null && _a !== void 0 ? _a : null,
                                description: (_b = dto.description) !== null && _b !== void 0 ? _b : null,
                                images: uploadedImages !== null && uploadedImages !== void 0 ? uploadedImages : [],
                                developerId: (_c = dto.developerId) !== null && _c !== void 0 ? _c : null,
                                zoneId: (_d = dto.zoneId) !== null && _d !== void 0 ? _d : null,
                                type: (_e = dto.type) !== null && _e !== void 0 ? _e : 'residential',
                                inventories: ((_f = dto.inventories) === null || _f === void 0 ? void 0 : _f.length) ? { connect: dto.inventories.map(function (id) { return ({ id: id }); }) }
                                    : undefined
                            },
                            include: {
                                developer: true,
                                zone: true,
                                inventories: true,
                                paymentPlans: true
                            }
                        })];
                    case 8:
                        project = _j.sent();
                        if (!(dto.paymentPlans && dto.paymentPlans.length > 0)) return [3 /*break*/, 12];
                        _i = 0, _h = dto.paymentPlans;
                        _j.label = 9;
                    case 9:
                        if (!(_i < _h.length)) return [3 /*break*/, 12];
                        plan = _h[_i];
                        return [4 /*yield*/, this.prisma.paymentPlan.create({
                                data: {
                                    downpayment: plan.downpayment,
                                    installment: 100 - plan.downpayment - plan.delivery,
                                    delivery: plan.delivery,
                                    schedule: plan.schedule,
                                    description: plan.description,
                                    yearsToPay: plan.yearsToPay,
                                    installmentPeriod: plan.installmentPeriod,
                                    installmentMonthsCount: plan.installmentMonthsCount,
                                    firstInstallmentDate: plan.firstInstallmentDate ? new Date(plan.firstInstallmentDate) : null,
                                    deliveryDate: plan.deliveryDate ? new Date(plan.deliveryDate) : null,
                                    projectId: project.id
                                }
                            })];
                    case 10:
                        _j.sent();
                        _j.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 9];
                    case 12: return [2 /*return*/, {
                            status: 201,
                            message: 'Project created successfully',
                            data: __assign(__assign({}, project), { images: (_g = project.images) !== null && _g !== void 0 ? _g : [] })
                        }];
                }
            });
        });
    };
    //  async getAllProjects(userId: string, userName: string, userRole: string) {
    ProjectsService.prototype.getAllProjects = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.project.findMany({
                            include: {
                                developer: false,
                                zone: false,
                                inventories: {
                                    include: {
                                        leads: false,
                                        visits: false
                                    }
                                },
                                paymentPlans: true
                            },
                            orderBy: { createdAt: 'desc' }
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Projects retrieved successfully',
                                data: data.map(function (project) {
                                    var _a, _b;
                                    return (__assign(__assign({}, project), { createdAt: (_a = project.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString(), images: (_b = project.images) !== null && _b !== void 0 ? _b : [], paymentPlans: project.paymentPlans.map(function (plan) {
                                            var _a, _b, _c, _d, _e, _f, _g;
                                            return (__assign(__assign({}, plan), { createdAt: (_a = plan.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString(), firstInstallmentDate: (_d = (_c = (_b = plan.firstInstallmentDate) === null || _b === void 0 ? void 0 : _b.toISOString) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : null, deliveryDate: (_g = (_f = (_e = plan.deliveryDate) === null || _e === void 0 ? void 0 : _e.toISOString) === null || _f === void 0 ? void 0 : _f.call(_e)) !== null && _g !== void 0 ? _g : null }));
                                        }), inventories: project.inventories.map(function (inv) {
                                            var _a, _b;
                                            return (__assign(__assign({}, inv), { createdAt: (_a = inv.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString(), images: (_b = inv.images) !== null && _b !== void 0 ? _b : [] }));
                                        }) }));
                                })
                            }];
                }
            });
        });
    };
    ProjectsService.prototype.updateProject = function (id, dto, userId, email, userRole) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var existingProject, developer, zone, duplicate, dataToUpdate, updatedProject, _i, _b, plan;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                            where: { id: id },
                            include: { paymentPlans: true }
                        })];
                    case 1:
                        existingProject = _c.sent();
                        if (!existingProject)
                            throw new common_1.NotFoundException('Project not found');
                        if (!dto.developerId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.developer.findUnique({
                                where: { id: dto.developerId }
                            })];
                    case 2:
                        developer = _c.sent();
                        if (!developer)
                            throw new common_1.NotFoundException('Developer not found');
                        _c.label = 3;
                    case 3:
                        if (!dto.zoneId) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.prisma.zone.findUnique({
                                where: { id: dto.zoneId }
                            })];
                    case 4:
                        zone = _c.sent();
                        if (!zone)
                            throw new common_1.NotFoundException('Zone not found');
                        _c.label = 5;
                    case 5:
                        if (!(dto.nameEn && dto.nameEn !== existingProject.nameEn)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.prisma.project.findFirst({
                                where: {
                                    nameEn: dto.nameEn,
                                    id: { not: id }
                                }
                            })];
                    case 6:
                        duplicate = _c.sent();
                        if (duplicate)
                            throw new common_1.ConflictException('Project with this English name already exists');
                        _c.label = 7;
                    case 7:
                        dataToUpdate = {};
                        if (dto.nameEn !== undefined)
                            dataToUpdate.nameEn = dto.nameEn;
                        if (dto.nameAr !== undefined)
                            dataToUpdate.nameAr = dto.nameAr;
                        if (dto.description !== undefined)
                            dataToUpdate.description = dto.description;
                        if (dto.images !== undefined)
                            dataToUpdate.images = dto.images;
                        if (dto.developerId !== undefined)
                            dataToUpdate.developerId = dto.developerId;
                        if (dto.zoneId !== undefined)
                            dataToUpdate.zoneId = dto.zoneId;
                        return [4 /*yield*/, this.prisma.project.update({
                                where: { id: id },
                                data: dataToUpdate,
                                include: {
                                    developer: true,
                                    zone: true,
                                    inventories: true,
                                    paymentPlans: true
                                }
                            })];
                    case 8:
                        updatedProject = _c.sent();
                        // 7. حذف خطط الدفع القديمة
                        return [4 /*yield*/, this.prisma.paymentPlan.deleteMany({
                                where: { projectId: id }
                            })];
                    case 9:
                        // 7. حذف خطط الدفع القديمة
                        _c.sent();
                        if (!(dto.paymentPlans && dto.paymentPlans.length > 0)) return [3 /*break*/, 13];
                        _i = 0, _b = dto.paymentPlans;
                        _c.label = 10;
                    case 10:
                        if (!(_i < _b.length)) return [3 /*break*/, 13];
                        plan = _b[_i];
                        return [4 /*yield*/, this.prisma.paymentPlan.create({
                                data: {
                                    downpayment: plan.downpayment,
                                    installment: 100 - plan.downpayment - plan.delivery,
                                    delivery: plan.delivery,
                                    schedule: plan.schedule,
                                    description: plan.description,
                                    yearsToPay: plan.yearsToPay,
                                    installmentPeriod: plan.installmentPeriod,
                                    installmentMonthsCount: plan.installmentMonthsCount,
                                    firstInstallmentDate: plan.firstInstallmentDate
                                        ? new Date(plan.firstInstallmentDate)
                                        : null,
                                    deliveryDate: plan.deliveryDate
                                        ? new Date(plan.deliveryDate)
                                        : null,
                                    projectId: id
                                }
                            })];
                    case 11:
                        _c.sent();
                        _c.label = 12;
                    case 12:
                        _i++;
                        return [3 /*break*/, 10];
                    case 13: 
                    // 9. إعادة المشروع المحدّث
                    return [2 /*return*/, {
                            status: 200,
                            message: 'Project updated successfully',
                            data: __assign(__assign({}, updatedProject), { images: (_a = updatedProject.images) !== null && _a !== void 0 ? _a : [] })
                        }];
                }
            });
        });
    };
    ProjectsService.prototype.deleteProject = function (id, userId, userName, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var exists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                            where: { id: id },
                            include: {
                                inventories: true,
                                paymentPlans: true
                            }
                        })];
                    case 1:
                        exists = _a.sent();
                        if (!exists)
                            throw new common_1.NotFoundException('Project not found');
                        // حذف جميع خطط الدفع المرتبطة بالمشروع
                        return [4 /*yield*/, this.prisma.paymentPlan.deleteMany({
                                where: { projectId: id }
                            })];
                    case 2:
                        // حذف جميع خطط الدفع المرتبطة بالمشروع
                        _a.sent();
                        // حذف المشروع
                        return [4 /*yield*/, this.prisma.project["delete"]({
                                where: { id: id }
                            })];
                    case 3:
                        // حذف المشروع
                        _a.sent();
                        // تسجيل العملية (يمكنك تفعيل السطر لو أردت تسجيل اللوج)
                        // await this.logsService.createLog({
                        //   userId,
                        //   userName,
                        //   userRole,
                        //   action: 'delete_project',
                        //   description: `Deleted project: id=${id}, name=${exists.nameEn}`,
                        // });
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Project deleted successfully'
                            }];
                }
            });
        });
    };
    ProjectsService = __decorate([
        common_1.Injectable()
    ], ProjectsService);
    return ProjectsService;
}());
exports.ProjectsService = ProjectsService;
