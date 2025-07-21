"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.NestedPaymentPlanDto = exports.InstallmentPeriodEnum = void 0;
var class_validator_1 = require("class-validator");
var IsLastInstallmentAfterFirst_1 = require("./IsLastInstallmentAfterFirst");
var InstallmentPeriodEnum;
(function (InstallmentPeriodEnum) {
    InstallmentPeriodEnum["MONTHLY"] = "monthly";
    InstallmentPeriodEnum["QUARTERLY"] = "quarterly";
    InstallmentPeriodEnum["YEARLY"] = "yearly";
    InstallmentPeriodEnum["CUSTOM"] = "custom";
})(InstallmentPeriodEnum = exports.InstallmentPeriodEnum || (exports.InstallmentPeriodEnum = {}));
var NestedPaymentPlanDto = /** @class */ (function () {
    function NestedPaymentPlanDto() {
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsUUID()
    ], NestedPaymentPlanDto.prototype, "id");
    __decorate([
        class_validator_1.IsNumber()
    ], NestedPaymentPlanDto.prototype, "downpayment");
    __decorate([
        class_validator_1.IsNumber()
    ], NestedPaymentPlanDto.prototype, "installment");
    __decorate([
        class_validator_1.IsNumber()
    ], NestedPaymentPlanDto.prototype, "delivery");
    __decorate([
        class_validator_1.IsString()
    ], NestedPaymentPlanDto.prototype, "schedule");
    __decorate([
        class_validator_1.IsNumber()
    ], NestedPaymentPlanDto.prototype, "yearsToPay");
    __decorate([
        class_validator_1.IsEnum(InstallmentPeriodEnum)
    ], NestedPaymentPlanDto.prototype, "installmentPeriod");
    __decorate([
        class_validator_1.IsNumber()
    ], NestedPaymentPlanDto.prototype, "installmentMonthsCount");
    __decorate([
        class_validator_1.IsDateString()
    ], NestedPaymentPlanDto.prototype, "firstInstallmentDate");
    __decorate([
        class_validator_1.IsDateString(),
        IsLastInstallmentAfterFirst_1.IsLastInstallmentAfterFirst('firstInstallmentDate', {
            message: 'Delivery date cannot be before the first installment date'
        })
    ], NestedPaymentPlanDto.prototype, "deliveryDate");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], NestedPaymentPlanDto.prototype, "description");
    return NestedPaymentPlanDto;
}());
exports.NestedPaymentPlanDto = NestedPaymentPlanDto;
