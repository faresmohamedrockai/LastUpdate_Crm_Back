import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import * as moment from 'moment';

export function IsFutureDateIfScheduled(
  property: string,
  validationOptions?: ValidationOptions,
) {
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

          if (!value) return true; // تخطي لو التاريخ مش موجود

          const date = moment(value);
          const today = moment().startOf('day');

          if (status === 'Scheduled') {
            return date.isSameOrAfter(today); // تاريخ اليوم أو بعده
          }

          if (status === 'Completed') {
            return date.isSameOrBefore(today); // تاريخ اليوم أو قبله
          }

          return true; // أي حالة تانية، لا نتحقق منها
        },
        defaultMessage(args: ValidationArguments) {
          const status = (args.object as any)[args.constraints[0]];

          if (status === 'Scheduled') {
            return `Date cannot be in the past if the status is Scheduled.`;
          }

          if (status === 'Completed') {
            return `Date cannot be in the future if the status is Completed.`;
          }

          return '';
        },
      },
    });
  };
}
