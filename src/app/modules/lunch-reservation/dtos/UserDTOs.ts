import { UserRole, UserType, UserStatus } from '../domain/entities/User';

export interface CreateUserDTO {
  cpf: string;
  password: string;
  name: string;
  role?: UserRole;
  userType?: UserType;
  status?: UserStatus;
}

export interface UpdateUserDTO {
  name?: string;
  password?: string;
  role?: UserRole;
  userType?: UserType;
  status?: UserStatus;
}

export interface UserResponseDTO {
  id: string;
  cpf: string;
  name: string;
  role: UserRole;
  userType: UserType;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
