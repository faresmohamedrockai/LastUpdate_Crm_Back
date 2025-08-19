"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MeetingsModule = void 0;
var common_1 = require("@nestjs/common");
var meetings_service_1 = require("./meetings.service");
var meetings_controller_1 = require("./meetings.controller");
var prisma_module_1 = require("../prisma/prisma.module");
var logs_module_1 = require("../logs/logs.module");
var email_module_1 = require("../email/email.module");
var MeetingsModule = /** @class */ (function () {
    function MeetingsModule() {
    }
    MeetingsModule = __decorate([
        common_1.Module({
            imports: [prisma_module_1.PrismaModule, logs_module_1.LogsModule, email_module_1.EmailModule],
            controllers: [meetings_controller_1.MeetingsController],
            providers: [meetings_service_1.MeetingsService],
            exports: [meetings_service_1.MeetingsService]
        })
    ], MeetingsModule);
    return MeetingsModule;
}());
exports.MeetingsModule = MeetingsModule;
