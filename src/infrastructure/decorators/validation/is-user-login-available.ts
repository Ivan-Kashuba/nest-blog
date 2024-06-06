import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../features/users/infrastructure/abstract-users.repository';

@ValidatorConstraint({ name: 'IsUserLoginOrEmailUnused', async: true })
@Injectable()
export class UserLoginOrEmailExistsConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepository: UsersRepository) {}
  async validate(value: string, args: ValidationArguments) {
    const shouldExist = args.constraints[0];

    const isValueOccupied =
      await this.usersRepository.findUserByLoginOrEmail(value);

    return shouldExist ? !!isValueOccupied : !isValueOccupied;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Value is already in use by other user';
  }
}

// https://github.com/typestack/class-validator?tab=readme-ov-file#custom-validation-decorators
export function UserLoginOrEmailExists(
  shouldExist: boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [shouldExist],
      validator: UserLoginOrEmailExistsConstraint,
    });
  };
}
