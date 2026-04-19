import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  fullName: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}
