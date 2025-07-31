import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsOptionalUUID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOptionalUUID',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // If value is undefined, null, or empty string, it's valid (optional)
          if (value === undefined || value === null || value === '') {
            return true;
          }
          
          // If value is provided, validate it as UUID using regex
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return typeof value === 'string' && uuidRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid UUID`;
        },
      },
    });
  };
} 