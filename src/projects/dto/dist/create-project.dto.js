"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreateProjectDto = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var create_payment_plan_dto_1 = require("../../payment-plans/dto/create-payment-plan.dto");
var CreateProjectDto = /** @class */ (function () {
    function CreateProjectDto() {
    }
    __decorate([
        class_validator_1.IsString()
    ], CreateProjectDto.prototype, "nameEn");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateProjectDto.prototype, "nameAr");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateProjectDto.prototype, "description");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray(),
        class_transformer_1.Transform(function (_a) {
            var value = _a.value;
            return (Array.isArray(value) ? value : [value]);
        })
    ], CreateProjectDto.prototype, "images");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateProjectDto.prototype, "image");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateProjectDto.prototype, "type");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray(),
        class_validator_1.IsUUID('all', { each: true })
    ], CreateProjectDto.prototype, "inventories");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateProjectDto.prototype, "developerId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsUUID()
    ], CreateProjectDto.prototype, "zoneId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray(),
        class_validator_1.ValidateNested({ each: true }),
        class_transformer_1.Type(function () { return create_payment_plan_dto_1.NestedPaymentPlanDto; })
    ], CreateProjectDto.prototype, "paymentPlans");
    return CreateProjectDto;
}());
exports.CreateProjectDto = CreateProjectDto;
