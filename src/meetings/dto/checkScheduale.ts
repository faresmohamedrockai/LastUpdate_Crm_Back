// src/validators/is-future-date-if-scheduled.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import * as moment from 'moment'; // لحساب التواريخ

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

          // لو الحالة Scheduled، نتحقق من التاريخ
          if (status === 'Scheduled') {
            return value && moment(value).isSameOrAfter(moment(), 'day'); // التاريخ اليوم أو بعده
          }

          return true; // لو مش Scheduled، مش مهم التاريخ
        },
        defaultMessage(args: ValidationArguments) {
          return `التاريخ لا يمكن أن يكون في الماضي إذا كانت الحالة Scheduled`;
        },
      },
    });
  };
}
