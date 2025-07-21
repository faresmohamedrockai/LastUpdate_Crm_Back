"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.LeadsController = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var roles_gaurd_1 = require("../auth/roles.gaurd");
var Role_decorator_1 = require("../auth/Role.decorator");
var roles_enum_1 = require("../auth/roles.enum");
var LeadsController = /** @class */ (function () {
    function LeadsController(leadsService) {
        this.leadsService = leadsService;
    }
    LeadsController.prototype.createLead = function (dto, req) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userId, email, role;
            return __generator(this, function (_b) {
                _a = req.user, userId = _a.userId, email = _a.email, role = _a.role;
                if (!userId) {
                    throw new common_1.BadRequestException('User ID not found in request');
                }
                return [2 /*return*/, this.leadsService.create(dto, userId, email, role)];
            });
        });
    };
    LeadsController.prototype.getLeads = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userId, email, role;
            return __generator(this, function (_b) {
                _a = req.user, userId = _a.userId, email = _a.email, role = _a.role;
                return [2 /*return*/, this.leadsService.getLeads(userId, email, role)];
            });
        });
    };
    // @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER, Role.SALES_REP)
    // @Get(':id')
    // async getLeadById(@Param('id') id: string, @Req() req) {
    //   const { id: userId, name: userName, role: userRole } = req.user;
    //   return this.leadsService.getLeadById(id, userId, userName, userRole);
    // }
    LeadsController.prototype.updateLead = function (id, dto, req) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userId, email, role;
            return __generator(this, function (_b) {
                _a = req.user, userId = _a.userId, email = _a.email, role = _a.role;
                return [2 /*return*/, this.leadsService.updateLead(id, dto, { id: userId, role: role }, email, role)];
            });
        });
    };
    LeadsController.prototype.deleteLead = function (id, req) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userId, email, role;
            return __generator(this, function (_b) {
                _a = req.user, userId = _a.userId, email = _a.email, role = _a.role;
                return [2 /*return*/, this.leadsService.deleteLead(id, userId, email, role)];
            });
        });
    };
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN, roles_enum_1.Role.SALES_ADMIN, roles_enum_1.Role.TEAM_LEADER, roles_enum_1.Role.SALES_REP),
        common_1.Post("create"),
        __param(0, common_1.Body()), __param(1, common_1.Req())
    ], LeadsController.prototype, "createLead");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN, roles_enum_1.Role.SALES_ADMIN, roles_enum_1.Role.TEAM_LEADER, roles_enum_1.Role.SALES_REP),
        common_1.Get(),
        __param(0, common_1.Req())
    ], LeadsController.prototype, "getLeads");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN, roles_enum_1.Role.SALES_ADMIN, roles_enum_1.Role.TEAM_LEADER, roles_enum_1.Role.SALES_REP),
        common_1.Patch(':id'),
        __param(0, common_1.Param('id')),
        __param(1, common_1.Body()),
        __param(2, common_1.Req())
    ], LeadsController.prototype, "updateLead");
    __decorate([
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN, roles_enum_1.Role.SALES_ADMIN),
        common_1.Delete(':id'),
        __param(0, common_1.Param('id')), __param(1, common_1.Req())
    ], LeadsController.prototype, "deleteLead");
    LeadsController = __decorate([
        common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_gaurd_1.RolesGuard),
        common_1.Controller('leads')
    ], LeadsController);
    return LeadsController;
}());
exports.LeadsController = LeadsController;
