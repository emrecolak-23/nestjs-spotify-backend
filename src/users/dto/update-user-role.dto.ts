import { IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRoles } from '../types/user-role.types';

export class UpdateUserRoleDTO {
  @IsEnum(UserRoles)
  @IsNotEmpty()
  @Type(() => String)
  readonly role: UserRoles;
}
