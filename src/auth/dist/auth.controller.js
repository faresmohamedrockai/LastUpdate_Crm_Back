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
exports.AuthController = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var roles_gaurd_1 = require("./roles.gaurd");
var Role_decorator_1 = require("./Role.decorator");
var roles_enum_1 = require("./roles.enum");
var AuthController = /** @class */ (function () {
    function AuthController(authService, logsService) {
        this.authService = authService;
        this.logsService = logsService;
    }
    AuthController.prototype.register = function (body) {
        return this.authService.register(body);
    };
    // @UseGuards(AuthGuard("jwt"), RolesGuard)
    // @Roles(Role.ADMIN, Role.SALES_ADMIN, Role.TEAM_LEADER)
    AuthController.prototype.GetUsrs = function (req) {
        var _a = req.user, role = _a.role, userId = _a.userId;
        //     {
        //   userId: '14157eb6-2cea-4a27-a6ba-69d3080fa24c',
        //   email: 'fares@gmail.com',
        //   role: 'admin'
        // }
        return this.authService.GetUsers(role, userId);
    };
    AuthController.prototype.deleteUser = function (id, assignToId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.deleteUser(id, assignToId)];
            });
        });
    };
    AuthController.prototype.updateUser = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.updateUser(id, data)];
            });
        });
    };
    AuthController.prototype.login = function (dto, res, req) {
        return __awaiter(this, void 0, void 0, function () {
            var UserData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.authService.login(dto)];
                    case 1:
                        UserData = _a.sent();
                        // ✅ إرسال فقط access_token + بيانات المستخدم
                        return [2 /*return*/, {
                                access_token: UserData.tokens.access_token,
                                user: UserData.user,
                                message: UserData.message,
                                status: UserData.status,
                                ok: true
                            }];
                }
            });
        });
    };
    // @Get('check')
    // checkToken(@Req() req: any) {
    //   const access_token = req.cookies?.access_token;
    //   return this.authService.checkAuth(access_token)
    // }
    // @Post('refresh')
    // async refreshToken(
    //   @Req() req: RequestWithCookies,
    //   @Res() res: Response
    // ) {
    //   const refreshToken = req.cookies?.refresh_token;
    //   if (!refreshToken) {
    //     throw new ForbiddenException('No refresh token provided');
    //   }
    //   const { access_token } = await this.authService.refreshToken(refreshToken);
    // res.cookie('access_token',access_token , {
    //   httpOnly: true,
    //   secure: true,
    //   maxAge: 1500000, // 1 ساعة
    // });
    //   return res.json({ access_token });
    // }
    AuthController.prototype.getOneUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.getOneUser(id)];
            });
        });
    };
    AuthController.prototype.logout = function (req, body, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, userName, userRole;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = body.userId;
                        userName = body.userName;
                        userRole = body.userRole;
                        if (req.cookies) {
                            Object.keys(req.cookies).forEach(function (cookieName) {
                                res.clearCookie(cookieName);
                            });
                        }
                        if (!userId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                action: 'logout',
                                description: 'User logged out',
                                userName: userName,
                                userRole: userRole
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, { message: 'Logout successful' }];
                }
            });
        });
    };
    __decorate([
        common_1.UseGuards(passport_1.AuthGuard("jwt"), roles_gaurd_1.RolesGuard),
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN),
        common_1.Post('add-user'),
        __param(0, common_1.Body())
    ], AuthController.prototype, "register");
    __decorate([
        common_1.Get('users'),
        __param(0, common_1.Req())
    ], AuthController.prototype, "GetUsrs");
    __decorate([
        common_1.Delete('delete-user/:id/leadsTo/:assignToId'),
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN),
        common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_gaurd_1.RolesGuard),
        __param(0, common_1.Param('id')),
        __param(1, common_1.Param('assignToId'))
    ], AuthController.prototype, "deleteUser");
    __decorate([
        common_1.UseGuards(passport_1.AuthGuard("jwt"), roles_gaurd_1.RolesGuard),
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN),
        common_1.Patch('update-user/:id'),
        __param(0, common_1.Param('id')),
        __param(1, common_1.Body())
    ], AuthController.prototype, "updateUser");
    __decorate([
        common_1.Post("login"),
        __param(0, common_1.Body()),
        __param(1, common_1.Res({ passthrough: true })),
        __param(2, common_1.Req())
    ], AuthController.prototype, "login");
    __decorate([
        common_1.UseGuards(passport_1.AuthGuard("jwt"), roles_gaurd_1.RolesGuard),
        Role_decorator_1.Roles(roles_enum_1.Role.ADMIN, roles_enum_1.Role.SALES_ADMIN),
        common_1.Get('user/:id'),
        __param(0, common_1.Param('id'))
    ], AuthController.prototype, "getOneUser");
    __decorate([
        common_1.Post('logout'),
        __param(0, common_1.Req()), __param(1, common_1.Body()), __param(2, common_1.Res({ passthrough: true }))
    ], AuthController.prototype, "logout");
    AuthController = __decorate([
        common_1.Controller('auth')
    ], AuthController);
    return AuthController;
}());
exports.AuthController = AuthController;
