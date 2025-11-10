import { PrismaClient } from "@prisma/client"
import { AuthController } from "@/infrastructure/http/controllers/AuthController"
import { AuthService } from "../AuthService"

export interface AuthModule {
  authController: AuthController
  authService: AuthService
}

export interface AuthFactoryConfig {
  database?: PrismaClient
  jwtSecret?: string
  jwtExpiresIn?: string
}
