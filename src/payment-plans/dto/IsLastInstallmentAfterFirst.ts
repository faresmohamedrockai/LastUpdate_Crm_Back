import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsLastInstallmentAfterFirst(
  firstKey: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isLastInstallmentAfterFirst',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [firstKey],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [firstKey] = args.constraints;
          const firstDate = new Date((args.object as any)[firstKey]);
          const lastDate = new Date(value);
          return lastDate >= firstDate;
        },
        defaultMessage(args: ValidationArguments) {
          const [firstKey] = args.constraints;
          return `The ${args.property} date cannot be before ${firstKey}`;
        },
      },
    });
  };
}
