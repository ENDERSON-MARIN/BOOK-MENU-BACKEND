export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum UserType {
  FIXO = 'FIXO',
  NAO_FIXO = 'NAO_FIXO'
}

export enum UserStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO'
}

export interface UserUpdateData {
  name?: string;
  password?: string;
  role?: UserRole;
  userType?: UserType;
  status?: UserStatus;
}

export class User {
  constructor(
    public readonly id: string,
    public readonly cpf: string,
    public password: string,
    public name: string,
    public role: UserRole,
    public userType: UserType,
    public status: UserStatus,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public toggleStatus(): void {
    this.status = this.status === UserStatus.ATIVO
      ? UserStatus.INATIVO
      : UserStatus.ATIVO;
  }

  public update(data: UserUpdateData): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.password !== undefined) this.password = data.password;
    if (data.role !== undefined) this.role = data.role;
    if (data.userType !== undefined) this.userType = data.userType;
    if (data.status !== undefined) this.status = data.status;
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  public isFixedUser(): boolean {
    return this.userType === UserType.FIXO;
  }

  public isActive(): boolean {
    return this.status === UserStatus.ATIVO;
  }
}
