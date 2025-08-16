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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.AuthService = void 0;
var common_1 = require("@nestjs/common");
var bcrypt = require("bcrypt");
var library_1 = require("@prisma/client/runtime/library");
var AuthService = /** @class */ (function () {
    function AuthService(prisma, jwtService, configService, logsService, cloudinaryService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logsService = logsService;
        this.cloudinaryService = cloudinaryService;
    }
    AuthService.prototype.register = function (userData) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var email, password, role, name, teamLeaderId, imageBase64, existingUser, emailRegex, existingAdmin, teamLeader, imageUrl, imageError_1, hashedPassword, user, error_1, target;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        email = userData.email, password = userData.password, role = userData.role, name = userData.name, teamLeaderId = userData.teamLeaderId, imageBase64 = userData.imageBase64;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 16, , 17]);
                        return [4 /*yield*/, this.prisma.user.findUnique({ where: { email: email } })];
                    case 2:
                        existingUser = _b.sent();
                        if (existingUser) {
                            throw new common_1.HttpException({
                                statusCode: 409,
                                error: 'Conflict',
                                message: 'Account Already Exists',
                                details: 'An account with this email address already exists. Please use a different email address or try logging in if this is your account.',
                                suggestion: 'Use a different email or login with existing credentials'
                            }, common_1.HttpStatus.CONFLICT);
                        }
                        emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(email)) {
                            throw new common_1.BadRequestException({
                                statusCode: 400,
                                error: 'Bad Request',
                                message: 'Invalid Email Format',
                                details: 'The email address format is not valid. Please provide a valid email address.',
                                suggestion: 'Use format like: user@example.com',
                                field: 'email'
                            });
                        }
                        if (!(userData.role === 'admin')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { role: 'admin' }
                            })];
                    case 3:
                        existingAdmin = _b.sent();
                        if (existingAdmin) {
                            throw new common_1.BadRequestException('Only one admin is allowed in the system!');
                        }
                        _b.label = 4;
                    case 4:
                        if (!(role === 'sales_rep')) return [3 /*break*/, 6];
                        if (!teamLeaderId) {
                            throw new common_1.HttpException('Team leader ID is required for sales representatives.', common_1.HttpStatus.BAD_REQUEST);
                        }
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: teamLeaderId }
                            })];
                    case 5:
                        teamLeader = _b.sent();
                        if (!teamLeader || teamLeader.role !== 'team_leader') {
                            throw new common_1.HttpException('Team leader not found or invalid role.', common_1.HttpStatus.BAD_REQUEST);
                        }
                        _b.label = 6;
                    case 6:
                        imageUrl = void 0;
                        if (!imageBase64) return [3 /*break*/, 11];
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, this.cloudinaryService.uploadImageFromBase64(imageBase64)];
                    case 8:
                        imageUrl = _b.sent();
                        console.log('✅ Image uploaded to Cloudinary:', imageUrl);
                        return [3 /*break*/, 10];
                    case 9:
                        imageError_1 = _b.sent();
                        console.error('❌ Image upload failed:', imageError_1);
                        throw new common_1.BadRequestException('Failed to upload image. Please try again with a valid image.');
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        console.log('ℹ️ No image uploaded');
                        _b.label = 12;
                    case 12: return [4 /*yield*/, bcrypt.hash(password, 10)];
                    case 13:
                        hashedPassword = _b.sent();
                        return [4 /*yield*/, this.prisma.user.create({
                                data: {
                                    email: email,
                                    name: name,
                                    password: hashedPassword,
                                    role: role,
                                    teamLeaderId: role === 'sales_rep' ? teamLeaderId : undefined,
                                    image: imageUrl
                                },
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                    role: true,
                                    teamLeaderId: true,
                                    image: true,
                                    createdAt: true
                                }
                            })];
                    case 14:
                        user = _b.sent();
                        return [2 /*return*/, user];
                    case 15:
                        //  تسجيل اللوج
                        _b.sent();
                        return [2 /*return*/, user];
                    case 16:
                        error_1 = _b.sent();
                        // Handle Prisma database constraint errors
                        if (error_1 instanceof library_1.PrismaClientKnownRequestError) {
                            if (error_1.code === 'P2002') {
                                target = (_a = error_1.meta) === null || _a === void 0 ? void 0 : _a.target;
                                if (target === null || target === void 0 ? void 0 : target.includes('email')) {
                                    throw new common_1.HttpException({
                                        statusCode: 409,
                                        error: 'Conflict',
                                        message: 'Email Already Registered',
                                        details: 'This email address is already registered in our system. Each email can only be used for one account.',
                                        suggestion: 'Please use a different email address or login if you already have an account',
                                        field: 'email'
                                    }, common_1.HttpStatus.CONFLICT);
                                }
                                throw new common_1.HttpException({
                                    statusCode: 409,
                                    error: 'Conflict',
                                    message: 'Duplicate Information',
                                    details: 'Some of the provided information conflicts with existing records.',
                                    suggestion: 'Please check your information and try again'
                                }, common_1.HttpStatus.CONFLICT);
                            }
                            if (error_1.code === 'P2003') {
                                // Foreign key constraint violation
                                throw new common_1.BadRequestException('Invalid team leader reference. Please select a valid team leader.');
                            }
                            if (error_1.code === 'P2025') {
                                // Record not found
                                throw new common_1.BadRequestException('Referenced record not found. Please check your input data.');
                            }
                        }
                        // Re-throw known application errors
                        if (error_1 instanceof common_1.HttpException || error_1 instanceof common_1.BadRequestException) {
                            throw error_1;
                        }
                        // Log unexpected errors for debugging
                        console.error('❌ Unexpected error during user registration:', error_1);
                        // Return generic error for unknown issues
                        throw new common_1.HttpException('Registration failed. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.login = function (loginData) {
        return __awaiter(this, void 0, void 0, function () {
            var email, password, ip, userAgent, existingUser, isPasswordValid, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = loginData.email, password = loginData.password, ip = loginData.ip, userAgent = loginData.userAgent;
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { email: email }
                            })];
                    case 1:
                        existingUser = _a.sent();
                        if (!existingUser) {
                            throw new common_1.NotFoundException('User not found');
                        }
                        return [4 /*yield*/, bcrypt.compare(password, existingUser.password)];
                    case 2:
                        isPasswordValid = _a.sent();
                        if (!isPasswordValid) {
                            throw new common_1.BadRequestException('Invalid password');
                        }
                        return [4 /*yield*/, this.generateTokens({
                                id: existingUser.id,
                                email: existingUser.email,
                                role: existingUser.role
                            })];
                    case 3:
                        tokens = _a.sent();
                        // 4. Successful login
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: existingUser.id,
                                action: 'login',
                                description: "User " + existingUser.email + " logged in",
                                userName: existingUser.name,
                                userRole: existingUser.role
                            })];
                    case 4:
                        // 4. Successful login
                        _a.sent();
                        return [2 /*return*/, {
                                tokens: tokens,
                                message: 'Login successful',
                                status: 200,
                                user: {
                                    id: existingUser.id,
                                    name: existingUser.name,
                                    email: existingUser.email,
                                    role: existingUser.role
                                },
                                ok: true
                            }];
                }
            });
        });
    };
    AuthService.prototype.GetUsers = function (role, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultSelect, users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔍 GetUsers called with role:', role, 'userId:', userId);
                        defaultSelect = {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            createdAt: true
                        };
                        if (!(role === 'admin')) return [3 /*break*/, 2];
                        console.log(' Admin access - fetching all users');
                        return [4 /*yield*/, this.prisma.user.findMany({
                                include: {
                                    teamLeader: true
                                }
                            })];
                    case 1:
                        users = _a.sent();
                        return [3 /*break*/, 7];
                    case 2:
                        if (!(role === 'sales_admin')) return [3 /*break*/, 4];
                        console.log(' Sales admin access - fetching sales users');
                        return [4 /*yield*/, this.prisma.user.findMany({
                                where: {
                                    role: {
                                        "in": ['sales_rep', 'sales_admin', 'team_leader']
                                    }
                                },
                                include: {
                                    teamLeader: true
                                }
                            })];
                    case 3:
                        users = _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        if (!(role === 'team_leader')) return [3 /*break*/, 6];
                        console.log(' Team leader access - fetching team members and self');
                        if (!userId) {
                            console.log(' Missing team leader ID');
                            throw new common_1.ForbiddenException('Missing team leader ID');
                        }
                        return [4 /*yield*/, this.prisma.user.findMany({
                                where: {
                                    OR: [
                                        { teamLeaderId: userId },
                                        { id: userId }
                                    ]
                                },
                                select: __assign(__assign({}, defaultSelect), { teamLeader: true })
                            })];
                    case 5:
                        users = _a.sent();
                        console.log(" Found " + users.length + " users for team leader " + userId);
                        return [3 /*break*/, 7];
                    case 6:
                        console.log(' Unauthorized role:', role);
                        throw new common_1.ForbiddenException('Unauthorized');
                    case 7: 
                    // ✅ تحويل createdAt إلى string
                    return [2 /*return*/, users.map(function (user) { return (__assign(__assign({}, user), { createdAt: user.createdAt.toISOString() })); })];
                }
            });
        });
    };
    AuthService.prototype.checkAuth = function (access_token) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.jwtService.verifyAsync(access_token, {
                                secret: this.configService.get('SECERT_JWT_ACCESS') || 'default_secret'
                            })];
                    case 1:
                        payload = _a.sent();
                        if (payload) {
                            return [2 /*return*/, {
                                    user: {
                                        ok: true,
                                        status: 200,
                                        message: 'Valid token'
                                    }
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    user: {
                                        ok: false,
                                        status: 401,
                                        message: 'Invalid or expired token'
                                    }
                                }];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                user: {
                                    ok: false,
                                    status: 401,
                                    message: 'Invalid or expired token'
                                }
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.refreshToken = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, user, access_token, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.jwtService.verifyAsync(refreshToken, {
                                secret: this.configService.get("SECERT_JWT_REFRESH")
                            })];
                    case 1:
                        payload = _a.sent();
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: payload.sub }
                            })];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            throw new common_1.ForbiddenException('User not found');
                        }
                        return [4 /*yield*/, this.jwtService.signAsync({
                                sub: user.id,
                                email: user.email,
                                role: user.role
                            }, {
                                secret: this.configService.get("SECERT_JWT_ACCESS"),
                                expiresIn: '15m'
                            })];
                    case 3:
                        access_token = _a.sent();
                        return [2 /*return*/, { access_token: access_token }];
                    case 4:
                        error_3 = _a.sent();
                        throw new common_1.ForbiddenException('Access Denied');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.getOneUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user, teamMembers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                            where: { id: id },
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new common_1.NotFoundException('User not found');
                        }
                        teamMembers = [];
                        if (!(user.role === 'team_leader')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.prisma.user.findMany({
                                where: { teamLeaderId: user.id },
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            })];
                    case 2:
                        teamMembers = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, {
                            status: 200,
                            message: 'User found',
                            user: __assign(__assign({}, user), { teamMembers: teamMembers })
                        }];
                }
            });
        });
    };
    // For Delete User Just admin can do it
    AuthService.prototype.deleteUser = function (id, assignToId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, assignToUser;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (id === assignToId) {
                            throw new common_1.BadRequestException('Cannot assign leads to the same user being deleted');
                        }
                        return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: id } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.NotFoundException("User not found");
                        return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: assignToId } })];
                    case 2:
                        assignToUser = _a.sent();
                        if (!assignToUser)
                            throw new common_1.NotFoundException("Assigned user not found");
                        return [4 /*yield*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, tx.lead.updateMany({
                                                where: { ownerId: id },
                                                data: { ownerId: assignToId }
                                            })];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, tx.log.deleteMany({ where: { userId: id } })];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, tx.user["delete"]({ where: { id: id } })];
                                        case 3:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: "User deleted and leads reassigned "
                            }];
                }
            });
        });
    };
    //Update User Data Just Admin
    AuthService.prototype.updateUser = function (id, data, userId, currentRole) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var existingUser, emailRegex, emailExists, _b, uploadedImage, imageError_2, imageBase64, updateData_1, updatedUser, error_4, target;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 12, , 13]);
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: id }
                            })];
                    case 1:
                        existingUser = _c.sent();
                        if (!existingUser) {
                            throw new common_1.NotFoundException("User not found");
                        }
                        // Role-based restrictions
                        if (currentRole !== 'admin' && currentRole !== 'sales_admin') {
                            // Non-admin users can only update their own profile and cannot change role or teamLeaderId
                            if (data.role !== undefined) {
                                throw new common_1.ForbiddenException('You cannot change your role');
                            }
                            if (data.teamLeaderId !== undefined) {
                                throw new common_1.ForbiddenException('You cannot change your team leader assignment');
                            }
                        }
                        if (data.role === "admin") {
                            throw new common_1.BadRequestException("You cannot create more than one admin in the system");
                        }
                        if (!(data.email && data.email !== existingUser.email)) return [3 /*break*/, 3];
                        emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(data.email)) {
                            throw new common_1.BadRequestException({
                                statusCode: 400,
                                error: 'Bad Request',
                                message: 'Invalid Email Format',
                                details: 'The email address format is not valid. Please provide a valid email address.',
                                suggestion: 'Use format like: user@example.com',
                                field: 'email'
                            });
                        }
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { email: data.email }
                            })];
                    case 2:
                        emailExists = _c.sent();
                        if (emailExists) {
                            throw new common_1.HttpException({
                                statusCode: 409,
                                error: 'Conflict',
                                message: 'Email Already In Use',
                                details: 'This email address is already associated with another account. Please choose a different email address.',
                                suggestion: 'Use a different email address for this account',
                                field: 'email'
                            }, common_1.HttpStatus.CONFLICT);
                        }
                        _c.label = 3;
                    case 3:
                        if (!data.password) return [3 /*break*/, 5];
                        _b = data;
                        return [4 /*yield*/, bcrypt.hash(data.password, 10)];
                    case 4:
                        _b.password = _c.sent();
                        _c.label = 5;
                    case 5:
                        if (!data.imageBase64) return [3 /*break*/, 9];
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.cloudinaryService.uploadImageFromBase64(data.imageBase64)];
                    case 7:
                        uploadedImage = _c.sent();
                        data.image = uploadedImage;
                        return [3 /*break*/, 9];
                    case 8:
                        imageError_2 = _c.sent();
                        console.error('❌ Image upload failed during user update:', imageError_2);
                        throw new common_1.BadRequestException('Failed to upload image. Please try again with a valid image.');
                    case 9:
                        imageBase64 = data.imageBase64, updateData_1 = __rest(data, ["imageBase64"]);
                        Object.keys(updateData_1).forEach(function (key) {
                            if (updateData_1[key] === undefined ||
                                updateData_1[key] === null ||
                                (typeof updateData_1[key] === 'string' && updateData_1[key].trim() === '')) {
                                delete updateData_1[key];
                            }
                        });
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { id: id },
                                data: updateData_1
                            })];
                    case 10:
                        updatedUser = _c.sent();
                        // Log the profile update
                        return [4 /*yield*/, this.logsService.createLog({
                                userId: userId,
                                email: existingUser.email,
                                userRole: currentRole,
                                action: 'update_user_profile',
                                description: "User profile updated: id=" + id + ", updatedBy=" + userId + ", role=" + currentRole
                            })];
                    case 11:
                        // Log the profile update
                        _c.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: "User updated successfully",
                                user: updatedUser
                            }];
                    case 12:
                        error_4 = _c.sent();
                        // Handle Prisma database constraint errors
                        if (error_4 instanceof library_1.PrismaClientKnownRequestError) {
                            if (error_4.code === 'P2002') {
                                target = (_a = error_4.meta) === null || _a === void 0 ? void 0 : _a.target;
                                if (target === null || target === void 0 ? void 0 : target.includes('email')) {
                                    throw new common_1.HttpException('This email address is already in use by another account. Please use a different email.', common_1.HttpStatus.CONFLICT);
                                }
                                throw new common_1.HttpException('A user with this information already exists.', common_1.HttpStatus.CONFLICT);
                            }
                            if (error_4.code === 'P2003') {
                                // Foreign key constraint violation
                                throw new common_1.BadRequestException('Invalid team leader reference. Please select a valid team leader.');
                            }
                            if (error_4.code === 'P2025') {
                                // Record not found
                                throw new common_1.NotFoundException('User not found.');
                            }
                        }
                        // Re-throw known application errors
                        if (error_4 instanceof common_1.HttpException ||
                            error_4 instanceof common_1.BadRequestException ||
                            error_4 instanceof common_1.NotFoundException ||
                            error_4 instanceof common_1.ForbiddenException) {
                            throw error_4;
                        }
                        // Log unexpected errors for debugging
                        console.error('❌ Unexpected error during user update:', error_4);
                        // Return generic error for unknown issues
                        throw new common_1.HttpException('User update failed. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    //This Function For generat access token and refresh token
    AuthService.prototype.generateTokens = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, access_token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            sub: userData.id,
                            email: userData.email,
                            role: userData.role
                        };
                        return [4 /*yield*/, this.jwtService.signAsync(payload, {
                                secret: this.configService.get('SECERT_JWT_ACCESS'),
                                expiresIn: '30d'
                            })];
                    case 1:
                        access_token = _a.sent();
                        return [2 /*return*/, {
                                access_token: access_token
                            }];
                }
            });
        });
    };
    AuthService = __decorate([
        common_1.Injectable()
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
