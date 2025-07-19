import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';
import * as moment from 'moment';

export function IsFutureDateIfScheduled(property: string, validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isFutureDateIfScheduled',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const relatedPropertyName = args.constraints[0];
                    const status = (args.object as any)[relatedPropertyName];

                    if (!value) return true; // Skip validation if no date

                    const date = moment(value);
                    const today = moment().startOf('day');

                    if (status === 'Scheduled') {
                        return date.isSameOrAfter(today); // Date must be today or in the future
                    } else {
                        return date.isSameOrBefore(today); // Date must be today or in the past
                    }
                },
                defaultMessage(args: ValidationArguments) {
                    const status = (args.object as any)[args.constraints[0]];
                    if (status === 'Scheduled') {
                        return `📅 Date cannot be in the past if the status is Scheduled.`;
                    } else {
                        return `📅 Date cannot be in the future unless the status is Scheduled.`;
                    }
                },
            },
        });
    };
}
