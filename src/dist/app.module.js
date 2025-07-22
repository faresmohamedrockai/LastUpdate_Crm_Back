"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
// src/app.module.ts
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var app_controller_1 = require("./app.controller");
var app_service_1 = require("./app.service");
var auth_module_1 = require("./auth/auth.module");
var leads_module_1 = require("./leads/leads.module");
var calls_module_1 = require("./calls/calls.module");
var visits_module_1 = require("./visits/visits.module");
var inventory_module_1 = require("./inventory/inventory.module");
var projects_module_1 = require("./projects/projects.module");
var developers_module_1 = require("./developers/developers.module");
var zones_module_1 = require("./zones/zones.module");
var logs_module_1 = require("./logs/logs.module");
var meetings_module_1 = require("./meetings/meetings.module");
var contracts_module_1 = require("./contracts/contracts.module");
var platform_express_1 = require("@nestjs/platform-express");
var prisma_module_1 = require("./prisma/prisma.module");
var jwt_1 = require("@nestjs/jwt");
var UserCheckMiddleware_1 = require("./common/middelwares/UserCheckMiddleware ");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule.prototype.configure = function (consumer) {
        consumer
            .apply(UserCheckMiddleware_1.UserCheckMiddleware)
            .exclude({ path: 'api/auth/login', method: common_1.RequestMethod.POST })
            .forRoutes('*');
    };
    AppModule = __decorate([
        common_1.Module({
            imports: [
                config_1.ConfigModule.forRoot({ isGlobal: true }),
                jwt_1.JwtModule.register({ secret: process.env.JWT_SECRET }),
                auth_module_1.AuthModule,
                leads_module_1.LeadsModule,
                calls_module_1.CallsModule,
                visits_module_1.VisitsModule,
                inventory_module_1.InventoryModule,
                projects_module_1.ProjectsModule,
                developers_module_1.DevelopersModule,
                zones_module_1.ZonesModule,
                prisma_module_1.PrismaModule,
                logs_module_1.LogsModule,
                meetings_module_1.MeetingsModule,
                contracts_module_1.ContractsModule,
                platform_express_1.MulterModule.register({}),
            ],
            controllers: [app_controller_1.AppController],
            providers: [app_service_1.AppService]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
