"use strict";
exports.__esModule = true;
exports.IsFutureDateIfScheduled = void 0;
var class_validator_1 = require("class-validator");
var moment = require("moment");
function IsFutureDateIfScheduled(property, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: 'isFutureDateIfScheduled',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: {
                validate: function (value, args) {
                    var relatedPropertyName = args.constraints[0];
                    var status = args.object[relatedPropertyName];
                    if (!value)
                        return true; // Skip validation if no date
                    var date = moment(value);
                    var today = moment().startOf('day');
                    if (status === 'Scheduled') {
                        return date.isSameOrAfter(today); // Date must be today or in the future
                    }
                    else {
                        return date.isSameOrBefore(today); // Date must be today or in the past
                    }
                },
                defaultMessage: function (args) {
                    var status = args.object[args.constraints[0]];
                    if (status === 'Scheduled') {
                        return "Date cannot be in the past if the status is Scheduled.";
                    }
                    else if (status === 'Completed') {
                        return "Date cannot be in the future if the status is Completed.";
                    }
                    else {
                        return true;
                    }
                }
            }
        });
    };
}
exports.IsFutureDateIfScheduled = IsFutureDateIfScheduled;
