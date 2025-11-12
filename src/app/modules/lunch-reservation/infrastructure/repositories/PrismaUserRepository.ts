// Note: If you see a TypeScript error here, run 'pnpm prisma generate' to generate the Prisma client
import { PrismaClient } from "@prisma/client"
import {
  User,
  UserRole,
  UserType,
  UserStatus,
} from "../../domain/entities/User"
import { UserRepository } from "../../domain/repositories/UserRepository"
import { CreateUserDTO, UpdateUserDTO } from "../../dtos/UserDTOs"

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByCpf(cpf: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { cpf },
    })

    return user ? this.toDomain(user) : null
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    return user ? this.toDomain(user) : null
  }

  async create(userData: CreateUserDTO): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        cpf: userData.cpf,
        password: userData.password,
        name: userData.name,
        role: userData.role || UserRole.USER,
        userType: userData.userType || UserType.NAO_FIXO,
        status: userData.status || UserStatus.ATIVO,
      },
    })

    return this.toDomain(created)
  }

  async update(id: string, userData: UpdateUserDTO): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(userData.name !== undefined && { name: userData.name }),
        ...(userData.password !== undefined && { password: userData.password }),
        ...(userData.role !== undefined && { role: userData.role }),
        ...(userData.userType !== undefined && { userType: userData.userType }),
        ...(userData.status !== undefined && { status: userData.status }),
      },
    })

    return this.toDomain(updated)
  }

  async findAll(includeInactive: boolean = false): Promise<User[]> {
    const whereClause = includeInactive ? {} : { status: UserStatus.ATIVO }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })

    return users.map(this.toDomain)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(data: any): User {
    return new User(
      data.id,
      data.cpf,
      data.password,
      data.name,
      data.role as UserRole,
      data.userType as UserType,
      data.status as UserStatus,
      data.createdAt,
      data.updatedAt
    )
  }
}
