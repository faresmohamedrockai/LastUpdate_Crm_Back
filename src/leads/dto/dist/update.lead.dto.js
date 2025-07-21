"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UpdateLeadDto = exports.LeadStatus = void 0;
// leads/dto/update-lead.dto.ts
var class_validator_1 = require("class-validator");
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["FRESH_LEAD"] = "fresh_lead";
    LeadStatus["FOLLOW_UP"] = "follow_up";
    LeadStatus["SCHEDULED_VISIT"] = "scheduled_visit";
    LeadStatus["OPEN_DEAL"] = "open_deal";
    LeadStatus["CANCELLATION"] = "cancellation";
    LeadStatus["CLOSED_DEAL"] = "closed_deal";
    LeadStatus["NO_ANSWER"] = "no_answer";
    LeadStatus["NOT_INTERSTED_NOW"] = "not_intersted_now";
})(LeadStatus = exports.LeadStatus || (exports.LeadStatus = {}));
var UpdateLeadDto = /** @class */ (function () {
    function UpdateLeadDto() {
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateLeadDto.prototype, "nameAr");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateLeadDto.prototype, "nameEn");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateLeadDto.prototype, "contact");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsNumber()
    ], UpdateLeadDto.prototype, "budget");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateLeadDto.prototype, "source");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], UpdateLeadDto.prototype, "assignedToId");
    __decorate([
        class_validator_1.IsOptional()
    ], UpdateLeadDto.prototype, "status");
    __decorate([
        class_validator_1.IsOptional()
    ], UpdateLeadDto.prototype, "lastCall");
    __decorate([
        class_validator_1.IsOptional()
    ], UpdateLeadDto.prototype, "notes");
    __decorate([
        class_validator_1.IsOptional()
    ], UpdateLeadDto.prototype, "lastVisit");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsUUID()
    ], UpdateLeadDto.prototype, "inventoryInterestId");
    return UpdateLeadDto;
}());
exports.UpdateLeadDto = UpdateLeadDto;
