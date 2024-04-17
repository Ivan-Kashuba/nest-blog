import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../features/users/infrastructure/users.repository';

@ValidatorConstraint({ name: 'IsUserLoginOrEmailUnused', async: true })
@Injectable()
export class UserLoginOrEmailUnusedConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepository: UsersRepository) {}
  async validate(value: any, args: ValidationArguments) {
    const isValueOccupied =
      await this.usersRepository.findUserByLoginOrEmail(value);

    return !isValueOccupied;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Value is already in use by other user';
  }
}

// https://github.com/typestack/class-validator?tab=readme-ov-file#custom-validation-decorators
export function IsUserLoginOrEmailUnused(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: UserLoginOrEmailUnusedConstraint,
    });
  };
}
