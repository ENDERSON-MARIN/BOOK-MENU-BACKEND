import { PrismaClient } from "@prisma/client"
import { AuthService } from "../AuthService"
import { AuthController } from "@/infrastructure/http/controllers/AuthController"
import { PrismaUserRepository } from "@/infrastructure/database/repositories/PrismaUserRepository"
import { AuthModule, AuthFactoryConfig } from "./types"

export function makeAuthModule(config?: AuthFactoryConfig): AuthModule {
  // Use provided config or fall back to environment variables
  const database = config?.database || new PrismaClient()
  const jwtSecret = config?.jwtSecret || process.env.JWT_SECRET || ""
  const jwtExpiresIn =
    config?.jwtExpiresIn || process.env.JWT_EXPIRES_IN || "24h"

  // Validate JWT secret
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required but not provided")
  }

  // Instantiate PrismaUserRepository with database client
  const userRepository = new PrismaUserRepository(database)

  // Instantiate AuthService with repository and JWT config
  const authService = new AuthService(userRepository, jwtSecret, jwtExpiresIn)

  // Instantiate AuthController with AuthService
  const authController = new AuthController(authService)

  // Return AuthModule with controller and service
  return {
    authController,
    authService,
  }
}
