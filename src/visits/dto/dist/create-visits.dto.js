"use strict";
// src/visit/dto/create-visit.dto.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreateVisitDto = void 0;
var class_validator_1 = require("class-validator");
var checkScheduale_1 = require("../../meetings/dto/checkScheduale");
var CreateVisitDto = /** @class */ (function () {
    function CreateVisitDto() {
    }
    __decorate([
        checkScheduale_1.IsFutureDateIfScheduled('status'),
        class_validator_1.IsDateString()
    ], CreateVisitDto.prototype, "date");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateVisitDto.prototype, "inventoryId");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateVisitDto.prototype, "objections");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateVisitDto.prototype, "notes");
    return CreateVisitDto;
}());
exports.CreateVisitDto = CreateVisitDto;
