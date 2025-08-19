"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreateTaskDto = void 0;
var class_validator_1 = require("class-validator");
var optional_uuid_decorator_1 = require("./optional-uuid.decorator");
var CreateTaskDto = /** @class */ (function () {
    function CreateTaskDto() {
    }
    __decorate([
        class_validator_1.IsString()
    ], CreateTaskDto.prototype, "title");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], CreateTaskDto.prototype, "description");
    __decorate([
        class_validator_1.IsDateString()
    ], CreateTaskDto.prototype, "dueDate");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsEnum(['low', 'medium', 'high', 'urgent'])
    ], CreateTaskDto.prototype, "priority");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsEnum(['pending', 'in_progress', 'completed', 'cancelled', 'overdue'])
    ], CreateTaskDto.prototype, "status");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsEnum(['follow_up', 'meeting_preparation', 'contract_review', 'payment_reminder', 'visit_scheduling', 'lead_nurturing', 'general'])
    ], CreateTaskDto.prototype, "type");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsBoolean()
    ], CreateTaskDto.prototype, "reminder");
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsDateString()
    ], CreateTaskDto.prototype, "reminderTime");
    __decorate([
        optional_uuid_decorator_1.IsOptionalUUID()
    ], CreateTaskDto.prototype, "assignedToId");
    __decorate([
        optional_uuid_decorator_1.IsOptionalUUID()
    ], CreateTaskDto.prototype, "leadId");
    __decorate([
        optional_uuid_decorator_1.IsOptionalUUID()
    ], CreateTaskDto.prototype, "projectId");
    __decorate([
        optional_uuid_decorator_1.IsOptionalUUID()
    ], CreateTaskDto.prototype, "inventoryId");
    return CreateTaskDto;
}());
exports.CreateTaskDto = CreateTaskDto;
