// Note: If you see a TypeScript error here, run 'pnpm prisma generate' to generate the Prisma client
import { PrismaClient } from "@prisma/client"
import {
  User,
  UserRepository,
  UserRole,
  UserType,
  UserStatus,
} from "@/app/modules/auth"

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
