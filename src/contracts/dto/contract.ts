import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import * as moment from 'moment';

export function IsFutureDateIfPendingOrSigned(
  statusField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isFutureDateIfPendingOrSigned',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [statusField],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const status = (args.object as any)[args.constraints[0]];
          if (!value) return true;

          const date = moment(value);
          const today = moment().startOf('day');

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

        defaultMessage(args: ValidationArguments) {
          const status = (args.object as any)[args.constraints[0]];
          if (status === 'Pending') {
            return 'Contract date must be today or in the future if status is Pending.';
          } else if (status === 'Signed') {
            return 'Contract date cannot be in the future if status is Signed.';
          } else if (status === 'Cancelled') {
            return 'Contract date should not be provided if status is Cancelled.';
          }
          return 'Invalid contract date based on status.';
        },
      },
    });
  };
}
