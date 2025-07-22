"use strict";
// ✅ InventoryService.ts - بعد التعديل الكامل
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
exports.InventoryService = void 0;
var common_1 = require("@nestjs/common");
var InventoryService = /** @class */ (function () {
    function InventoryService(prisma, logsService, CloudinaryService) {
        this.prisma = prisma;
        this.logsService = logsService;
        this.CloudinaryService = CloudinaryService;
    }
    InventoryService.prototype.createInventory = function (dto, userId, email, role) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var project, paymentPlan, uploadedImages, inventory;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!dto.projectId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: dto.projectId },
                                include: { developer: true, zone: true }
                            })];
                    case 1:
                        project = _c.sent();
                        if (!project)
                            throw new common_1.NotFoundException('Project not found');
                        _c.label = 2;
                    case 2:
                        if (!dto.paymentPlanId) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.prisma.paymentPlan.findUnique({
                                where: { id: dto.paymentPlanId }
                            })];
                    case 3:
                        paymentPlan = _c.sent();
                        if (!paymentPlan)
                            throw new common_1.NotFoundException('Payment plan not found');
                        _c.label = 4;
                    case 4:
                        uploadedImages = [];
                        if (!(dto.images && dto.images.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, Promise.all(dto.images.map(function (base64, index) {
                                return _this.CloudinaryService.uploadImageFromBase64(base64, 'projects', "project_" + Date.now() + "_" + index);
                            }))];
                    case 5:
                        uploadedImages = _c.sent();
                        _c.label = 6;
                    case 6: return [4 /*yield*/, this.prisma.inventory.create({
                            data: {
                                title: dto.title,
                                titleEn: dto.titleEn,
                                titleAr: dto.titleAr,
                                type: dto.type,
                                price: dto.price,
                                images: uploadedImages,
                                location: dto.location,
                                area: dto.area,
                                bedrooms: dto.bedrooms,
                                bathrooms: dto.bathrooms,
                                amenities: (_a = dto.amenities) !== null && _a !== void 0 ? _a : [],
                                typeOther: dto.typeOther,
                                amenitiesOther: dto.amenitiesOther,
                                status: dto.status,
                                zoneId: dto.zoneId,
                                projectId: dto.projectId,
                                developerId: dto.developerId,
                                paymentPlanId: dto.paymentPlanId
                            },
                            include: {
                                project: { include: { developer: true, zone: true } },
                                paymentPlan: true,
                                leads: true
                            }
                        })];
                    case 7:
                        inventory = _c.sent();
                        // Log developer deletion
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: role,
                                action: 'Create Inventory',
                                description: "Inventory developer: id=" + inventory.id + ", name=" + inventory.titleEn
                            })];
                    case 8:
                        // Log developer deletion
                        _c.sent();
                        return [2 /*return*/, {
                                status: 201,
                                message: 'Inventory created successfully',
                                data: __assign(__assign({}, inventory), { images: (_b = inventory.images) !== null && _b !== void 0 ? _b : [] })
                            }];
                }
            });
        });
    };
    InventoryService.prototype.getAllInventories = function (userId, userName, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var inventories;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.inventory.findMany({
                            include: {
                                project: { include: { developer: true, zone: true } },
                                paymentPlan: true,
                                leads: true
                            },
                            orderBy: { createdAt: 'desc' }
                        })];
                    case 1:
                        inventories = _a.sent();
                        return [2 /*return*/, {
                                properties: inventories.map(function (inventory) {
                                    var _a;
                                    return (__assign(__assign({}, inventory), { images: (_a = inventory.images) !== null && _a !== void 0 ? _a : [] }));
                                })
                            }];
                }
            });
        });
    };
    InventoryService.prototype.updateInventory = function (id, dto, userId, email, role) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var existingInventory, project, paymentPlan, uploadedImages, updatedInventory;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.prisma.inventory.findUnique({
                            where: { id: id },
                            include: { project: true }
                        })];
                    case 1:
                        existingInventory = _b.sent();
                        if (!existingInventory)
                            throw new common_1.NotFoundException('Inventory not found');
                        if (!dto.projectId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: dto.projectId },
                                include: { developer: true, zone: true }
                            })];
                    case 2:
                        project = _b.sent();
                        if (!project)
                            throw new common_1.NotFoundException('Project not found');
                        _b.label = 3;
                    case 3:
                        if (!dto.paymentPlanId) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.prisma.paymentPlan.findUnique({
                                where: { id: dto.paymentPlanId }
                            })];
                    case 4:
                        paymentPlan = _b.sent();
                        if (!paymentPlan)
                            throw new common_1.NotFoundException('Payment plan not found');
                        _b.label = 5;
                    case 5:
                        uploadedImages = [];
                        if (!(dto.images && dto.images.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, Promise.all(dto.images.map(function (base64, index) {
                                return _this.CloudinaryService.uploadImageFromBase64(base64, 'projects', "project_" + Date.now() + "_" + index);
                            }))];
                    case 6:
                        uploadedImages = _b.sent();
                        _b.label = 7;
                    case 7: return [4 /*yield*/, this.prisma.inventory.update({
                            where: { id: id },
                            data: {
                                title: dto.title,
                                titleEn: dto.titleEn,
                                titleAr: dto.titleAr,
                                type: dto.type,
                                price: dto.price,
                                location: dto.location,
                                area: dto.area,
                                bedrooms: dto.bedrooms,
                                bathrooms: dto.bathrooms,
                                amenities: dto.amenities,
                                typeOther: dto.typeOther,
                                amenitiesOther: dto.amenitiesOther,
                                images: uploadedImages,
                                status: dto.status,
                                zoneId: dto.zoneId,
                                projectId: dto.projectId,
                                developerId: dto.developerId,
                                paymentPlanId: dto.paymentPlanId
                            },
                            include: {
                                project: { include: { developer: true, zone: true } },
                                paymentPlan: true,
                                leads: true
                            }
                        })];
                    case 8:
                        updatedInventory = _b.sent();
                        // Log  
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: role,
                                action: 'delete_developer',
                                description: "Deleted developer: id=" + updatedInventory.id + ", name=" + updatedInventory.titleEn
                            })];
                    case 9:
                        // Log  
                        _b.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Inventory updated successfully',
                                data: __assign(__assign({}, updatedInventory), { images: (_a = updatedInventory.images) !== null && _a !== void 0 ? _a : [] })
                            }];
                }
            });
        });
    };
    InventoryService.prototype.deleteInventory = function (id, userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var existingInventory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.inventory.findUnique({
                            where: { id: id },
                            include: { leads: true }
                        })];
                    case 1:
                        existingInventory = _a.sent();
                        if (!existingInventory)
                            throw new common_1.NotFoundException('Inventory not found');
                        if (existingInventory.leads.length > 0) {
                            throw new common_1.ConflictException('Cannot delete inventory with existing leads or visits');
                        }
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: email,
                                userRole: role,
                                action: 'delete_inventory',
                                description: "Deleted inventory: id=" + id + ", title=" + existingInventory.title
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.prisma.inventory["delete"]({ where: { id: id } })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Inventory deleted successfully'
                            }];
                }
            });
        });
    };
    InventoryService = __decorate([
        common_1.Injectable()
    ], InventoryService);
    return InventoryService;
}());
exports.InventoryService = InventoryService;
