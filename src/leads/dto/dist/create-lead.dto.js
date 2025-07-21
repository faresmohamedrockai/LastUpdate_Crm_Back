"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreateLeadDto = exports.LeadStatus = void 0;
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
    LeadStatus["RESERVATION"] = "reservation";
})(LeadStatus = exports.LeadStatus || (exports.LeadStatus = {}));
var CreateLeadDto = /** @class */ (function () {
    function CreateLeadDto() {
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "name");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "nameAr");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "nameEn");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "contact");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "assignedToId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "budget");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "notes");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "source");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsEnum(LeadStatus)
    ], CreateLeadDto.prototype, "status");
    __decorate([
        class_validator_1.IsOptional()
    ], CreateLeadDto.prototype, "lastCall");
    __decorate([
        class_validator_1.IsOptional()
    ], CreateLeadDto.prototype, "lastVisit");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsUUID()
    ], CreateLeadDto.prototype, "inventoryInterestId");
    return CreateLeadDto;
}());
exports.CreateLeadDto = CreateLeadDto;
