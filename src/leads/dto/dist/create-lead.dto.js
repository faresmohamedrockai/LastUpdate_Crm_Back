"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreateLeadDto = exports.Tier = exports.Interest = exports.LeadStatus = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["FRESH_LEAD"] = "fresh_lead";
    LeadStatus["FOLLOW_UP"] = "follow_up";
    LeadStatus["SCHEDULED_VISIT"] = "scheduled_visit";
    LeadStatus["OPEN_DEAL"] = "open_deal";
    LeadStatus["CANCELLATION"] = "cancellation";
    LeadStatus["CLOSED_DEAL"] = "closed_deal";
    LeadStatus["VIP"] = "vip";
    LeadStatus["NON_STOP"] = "non_stop";
    LeadStatus["NO_ANSWER"] = "no_answer";
    LeadStatus["NOT_INTERSTED_NOW"] = "not_intersted_now";
    LeadStatus["RESERVATION"] = "reservation";
})(LeadStatus = exports.LeadStatus || (exports.LeadStatus = {}));
var Interest;
(function (Interest) {
    Interest["HOT"] = "hot";
    Interest["WARM"] = "warm";
    Interest["UNDER_DECISION"] = "under_decision";
})(Interest = exports.Interest || (exports.Interest = {}));
var Tier;
(function (Tier) {
    Tier["BRONZE"] = "bronze";
    Tier["SILVER"] = "silver";
    Tier["GOLD"] = "gold";
    Tier["PLATINUM"] = "platinum";
})(Tier = exports.Tier || (exports.Tier = {}));
var CreateLeadDto = /** @class */ (function () {
    function CreateLeadDto() {
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "familyName");
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
    ], CreateLeadDto.prototype, "otherProject");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray(),
        class_validator_1.IsString({ each: true })
    ], CreateLeadDto.prototype, "contacts");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "email");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "description");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "assignedToId");
    __decorate([
        class_validator_1.IsOptional()
    ], CreateLeadDto.prototype, "budget");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsBoolean()
    ], CreateLeadDto.prototype, "cil");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsArray(),
        class_validator_1.IsString({ each: true })
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
        class_validator_1.IsOptional(),
        class_validator_1.IsDate()
    ], CreateLeadDto.prototype, "lastCall");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsDate()
    ], CreateLeadDto.prototype, "lastVisit");
    __decorate([
        class_validator_1.IsOptional(),
        class_transformer_1.Type(function () { return Date; }) // يحول من string لـ Date
        ,
        class_validator_1.IsDate()
    ], CreateLeadDto.prototype, "firstConection");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "inventoryInterestId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "projectInterestId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateLeadDto.prototype, "contact");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsEnum(Interest)
    ], CreateLeadDto.prototype, "interest");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsEnum(Tier)
    ], CreateLeadDto.prototype, "tier");
    return CreateLeadDto;
}());
exports.CreateLeadDto = CreateLeadDto;
