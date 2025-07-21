"use strict";
exports.__esModule = true;
exports.IsFutureDateIfPendingOrSigned = void 0;
var class_validator_1 = require("class-validator");
var moment = require("moment");
function IsFutureDateIfPendingOrSigned(statusField, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isFutureDateIfPendingOrSigned',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [statusField],
            validator: {
                validate: function (value, args) {
                    var status = args.object[args.constraints[0]];
                    if (!value)
                        return true;
                    var date = moment(value);
                    var today = moment().startOf('day');
                    if (status === 'Pending') {
                        return true; // المستقبل أو اليوم
                    }
                    if (status === 'Signed') {
                        return date.isSameOrBefore(today); // الماضي أو اليوم
                    }
                    if (status === 'Cancelled') {
                        return true; // التاريخ غير مسموح
                    }
                    return true; // باقي الحالات
                },
                defaultMessage: function (args) {
                    var status = args.object[args.constraints[0]];
                    if (status === 'Pending') {
                        return 'Contract date must be today or in the future if status is Pending.';
                    }
                    else if (status === 'Signed') {
                        return 'Contract date cannot be in the future if status is Signed.';
                    }
                    else if (status === 'Cancelled') {
                        return 'Contract date should not be provided if status is Cancelled.';
                    }
                    return 'Invalid contract date based on status.';
                }
            }
        });
    };
}
exports.IsFutureDateIfPendingOrSigned = IsFutureDateIfPendingOrSigned;
