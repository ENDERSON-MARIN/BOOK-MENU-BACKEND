export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum UserType {
  FIXO = "FIXO",
  NAO_FIXO = "NAO_FIXO",
}

export enum UserStatus {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
}

export class User {
  constructor(
    public readonly id: string,
    public cpf: string,
    public password: string,
    public name: string,
    public role: UserRole,
    public userType: UserType,
    public status: UserStatus,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public isActive(): boolean {
    return this.status === UserStatus.ATIVO
  }
}
