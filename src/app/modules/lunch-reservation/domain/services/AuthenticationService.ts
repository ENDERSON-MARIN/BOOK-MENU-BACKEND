import { User, UserStatus } from "../entities/User"
import { UserRepository } from "../repositories/UserRepository"
import { AppError } from "@/app/shared"
import * as crypto from "crypto"

export interface LoginCredentials {
  cpf: string
  password: string
}

export interface AuthenticationResult {
  user: User
  token: string
}

export interface TokenPayload {
  userId: string
  cpf: string
  role: string
  userType: string
}

export class AuthenticationService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "default-secret-key"
  private readonly TOKEN_EXPIRY = "24h"

  constructor(private userRepository: UserRepository) {}

  async login(credentials: LoginCredentials): Promise<AuthenticationResult> {
    // Validate CPF format
    if (!this.isValidCpf(credentials.cpf)) {
      throw new AppError("CPF inválido", 400)
    }

    // Find user by CPF
    const user = await this.userRepository.findByCpf(credentials.cpf)
    if (!user) {
      throw new AppError("Credenciais inválidas", 401)
    }

    // Check if user is active
    if (user.status !== UserStatus.ATIVO) {
      throw new AppError("Usuário inativo", 401)
    }

    // Validate password
    if (!this.validatePassword(credentials.password, user.password)) {
      throw new AppError("Credenciais inválidas", 401)
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      cpf: user.cpf,
      role: user.role,
      userType: user.userType,
    })

    return {
      user,
      token,
    }
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      // For now, implement a simple token validation
      // In a real implementation, this would use jsonwebtoken library
      const payload = this.decodeToken(token)

      // Verify user still exists and is active
      const user = await this.userRepository.findById(payload.userId)
      if (!user || user.status !== UserStatus.ATIVO) {
        throw new AppError("Token inválido", 401)
      }

      return payload
    } catch {
      throw new AppError("Token inválido", 401)
    }
  }

  async refreshToken(oldToken: string): Promise<string> {
    const payload = await this.validateToken(oldToken)

    // Generate new token with same payload
    return this.generateToken(payload)
  }

  private isValidCpf(cpf: string): boolean {
    // Remove non-numeric characters
    const cleanCpf = cpf.replace(/\D/g, "")

    // Check if has 11 digits
    if (cleanCpf.length !== 11) {
      return false
    }

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return false
    }

    // Validate CPF algorithm
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false

    return true
  }

  private validatePassword(
    plainPassword: string,
    hashedPassword: string
  ): boolean {
    // For now, implement simple password comparison
    // In a real implementation, this would use bcrypt
    return this.hashPassword(plainPassword) === hashedPassword
  }

  public hashPassword(password: string): string {
    // Simple hash implementation using crypto
    // In a real implementation, this would use bcrypt
    return crypto
      .createHash("sha256")
      .update(password + this.JWT_SECRET)
      .digest("hex")
  }

  private generateToken(payload: TokenPayload): string {
    // Simple token generation - in a real implementation, use jsonwebtoken
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" })
    ).toString("base64url")
    const payloadWithExp = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      iat: Math.floor(Date.now() / 1000),
    }
    const payloadEncoded = Buffer.from(JSON.stringify(payloadWithExp)).toString(
      "base64url"
    )

    const signature = crypto
      .createHmac("sha256", this.JWT_SECRET)
      .update(`${header}.${payloadEncoded}`)
      .digest("base64url")

    return `${header}.${payloadEncoded}.${signature}`
  }

  private decodeToken(token: string): TokenPayload {
    const parts = token.split(".")
    if (parts.length !== 3) {
      throw new Error("Invalid token format")
    }

    const [header, payload, signature] = parts

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", this.JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url")

    if (signature !== expectedSignature) {
      throw new Error("Invalid token signature")
    }

    // Decode payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    )

    // Check expiration
    if (
      decodedPayload.exp &&
      decodedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      throw new Error("Token expired")
    }

    return {
      userId: decodedPayload.userId,
      cpf: decodedPayload.cpf,
      role: decodedPayload.role,
      userType: decodedPayload.userType,
    }
  }
}
