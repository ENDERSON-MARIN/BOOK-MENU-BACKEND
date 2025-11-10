import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { AppError } from "../../shared"
import { User, UserRole } from "./domain/User"
import { UserRepository } from "./domain/UserRepository"
import { AuthResponseDTO } from "./dtos/AuthResponseDTO"

export interface TokenPayload {
  userId: string
  cpf: string
  role: UserRole
  iat: number
  exp: number
}

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtSecret: string,
    private jwtExpiresIn: string | number = "24h"
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  generateToken(user: User): string {
    const payload = {
      userId: user.id,
      cpf: user.cpf,
      role: user.role,
    }

    // @ts-expect-error - Type mismatch in @types/jsonwebtoken version
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    })
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload
      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Token expirado", 401)
      }
      throw new AppError("Token inválido", 401)
    }
  }

  async login(cpf: string, password: string): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByCpf(cpf)

    if (!user) {
      throw new AppError("Credenciais inválidas", 401)
    }

    const isPasswordValid = await this.comparePassword(password, user.password)

    if (!isPasswordValid) {
      throw new AppError("Credenciais inválidas", 401)
    }

    if (!user.isActive()) {
      throw new AppError("Usuário inativo", 403)
    }

    const token = this.generateToken(user)

    return {
      token,
      user: {
        id: user.id,
        cpf: user.cpf,
        name: user.name,
        role: user.role,
      },
    }
  }
}
