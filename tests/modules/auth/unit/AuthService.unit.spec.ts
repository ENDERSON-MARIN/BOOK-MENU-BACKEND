/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest"
import { AuthService } from "../../../../src/app/modules/auth/AuthService"
import { UserRepository } from "../../../../src/app/modules/auth/domain/UserRepository"
import {
  User,
  UserRole,
  UserStatus,
  UserType,
} from "../../../../src/app/modules/auth/domain/User"
import jwt from "jsonwebtoken"

describe("AuthService Unit Tests", () => {
  let authService: AuthService
  let mockUserRepository: UserRepository
  const jwtSecret = "test-secret-key-for-unit-tests"
  const jwtExpiresIn = "24h"

  beforeEach(() => {
    // Create mock repository
    mockUserRepository = {
      findByCpf: vi.fn(),
      findById: vi.fn(),
    }

    // Initialize AuthService with mock repository
    authService = new AuthService(mockUserRepository, jwtSecret, jwtExpiresIn)
  })

  describe("16.1 Test hashPassword and comparePassword methods", () => {
    it("should hash password correctly", async () => {
      const password = "testPassword123"
      const hashedPassword = await authService.hashPassword(password)

      // Verify password is hashed (not equal to original)
      expect(hashedPassword).not.toBe(password)

      // Verify hash is a string
      expect(typeof hashedPassword).toBe("string")

      // Verify hash has reasonable length (bcrypt hashes are 60 characters)
      expect(hashedPassword.length).toBeGreaterThan(50)
    })

    it("should return true when comparing correct password with hash", async () => {
      const password = "correctPassword123"
      const hashedPassword = await authService.hashPassword(password)

      const result = await authService.comparePassword(password, hashedPassword)

      expect(result).toBe(true)
    })

    it("should return false when comparing incorrect password with hash", async () => {
      const correctPassword = "correctPassword123"
      const incorrectPassword = "wrongPassword456"
      const hashedPassword = await authService.hashPassword(correctPassword)

      const result = await authService.comparePassword(
        incorrectPassword,
        hashedPassword
      )

      expect(result).toBe(false)
    })
  })

  describe("16.2 Test generateToken method", () => {
    it("should generate token containing userId, cpf, role, and iat", () => {
      const testUser = new User(
        "test-user-id-123",
        "12345678901",
        "hashedPassword",
        "Test User",
        UserRole.USER,
        UserType.NAO_FIXO,
        UserStatus.ATIVO
      )

      const token = authService.generateToken(testUser)

      // Verify token is a string
      expect(typeof token).toBe("string")
      expect(token.length).toBeGreaterThan(0)

      // Decode token to verify payload
      const decoded = jwt.verify(token, jwtSecret) as any

      // Verify token contains required fields
      expect(decoded).toHaveProperty("userId")
      expect(decoded.userId).toBe(testUser.id)

      expect(decoded).toHaveProperty("cpf")
      expect(decoded.cpf).toBe(testUser.cpf)

      expect(decoded).toHaveProperty("role")
      expect(decoded.role).toBe(testUser.role)

      expect(decoded).toHaveProperty("iat")
      expect(typeof decoded.iat).toBe("number")
    })

    it("should sign token with the provided secret", () => {
      const testUser = new User(
        "test-user-id-456",
        "98765432109",
        "hashedPassword",
        "Admin User",
        UserRole.ADMIN,
        UserType.FIXO,
        UserStatus.ATIVO
      )

      const token = authService.generateToken(testUser)

      // Verify token can be decoded with the correct secret
      expect(() => {
        jwt.verify(token, jwtSecret)
      }).not.toThrow()

      // Verify token cannot be decoded with wrong secret
      expect(() => {
        jwt.verify(token, "wrong-secret")
      }).toThrow()
    })
  })

  describe("16.3 Test validateToken method", () => {
    it("should decode valid token correctly", async () => {
      const testUser = new User(
        "test-user-id-789",
        "11122233344",
        "hashedPassword",
        "Valid User",
        UserRole.USER,
        UserType.NAO_FIXO,
        UserStatus.ATIVO
      )

      const token = authService.generateToken(testUser)
      const decoded = await authService.validateToken(token)

      // Verify decoded payload contains correct data
      expect(decoded.userId).toBe(testUser.id)
      expect(decoded.cpf).toBe(testUser.cpf)
      expect(decoded.role).toBe(testUser.role)
      expect(decoded).toHaveProperty("iat")
      expect(decoded).toHaveProperty("exp")
    })

    it("should throw error for invalid token", async () => {
      const invalidToken = "invalid.token.here"

      await expect(authService.validateToken(invalidToken)).rejects.toThrow(
        "Token inválido"
      )
    })

    it("should throw error for expired token", async () => {
      // Create a token with immediate expiration
      const expiredAuthService = new AuthService(
        mockUserRepository,
        jwtSecret,
        "0s"
      )

      const testUser = new User(
        "test-user-id-expired",
        "55566677788",
        "hashedPassword",
        "Expired User",
        UserRole.USER,
        UserType.NAO_FIXO,
        UserStatus.ATIVO
      )

      const expiredToken = expiredAuthService.generateToken(testUser)

      // Wait a moment to ensure token is expired
      await new Promise((resolve) => setTimeout(resolve, 100))

      await expect(authService.validateToken(expiredToken)).rejects.toThrow(
        "Token expirado"
      )
    })
  })

  describe("16.4 Test login method with various scenarios", () => {
    it("should successfully login with valid credentials", async () => {
      const password = "validPassword123"
      const hashedPassword = await authService.hashPassword(password)

      const testUser = new User(
        "test-user-login-1",
        "12345678901",
        hashedPassword,
        "Login User",
        UserRole.USER,
        UserType.NAO_FIXO,
        UserStatus.ATIVO
      )

      // Mock repository to return the test user
      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(testUser)

      const result = await authService.login(testUser.cpf, password)

      // Verify response structure
      expect(result).toHaveProperty("token")
      expect(result).toHaveProperty("user")

      // Verify token is valid
      expect(typeof result.token).toBe("string")
      expect(result.token.length).toBeGreaterThan(0)

      // Verify user data
      expect(result.user.id).toBe(testUser.id)
      expect(result.user.cpf).toBe(testUser.cpf)
      expect(result.user.name).toBe(testUser.name)
      expect(result.user.role).toBe(testUser.role)

      // Verify password is not included
      expect(result.user).not.toHaveProperty("password")

      // Verify repository was called
      expect(mockUserRepository.findByCpf).toHaveBeenCalledWith(testUser.cpf)
    })

    it("should throw error for non-existent user", async () => {
      // Mock repository to return null (user not found)
      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(null)

      await expect(
        authService.login("99999999999", "anyPassword")
      ).rejects.toThrow("Credenciais inválidas")

      expect(mockUserRepository.findByCpf).toHaveBeenCalledWith("99999999999")
    })

    it("should throw error for incorrect password", async () => {
      const correctPassword = "correctPassword123"
      const incorrectPassword = "wrongPassword456"
      const hashedPassword = await authService.hashPassword(correctPassword)

      const testUser = new User(
        "test-user-login-2",
        "98765432109",
        hashedPassword,
        "Password Test User",
        UserRole.USER,
        UserType.NAO_FIXO,
        UserStatus.ATIVO
      )

      // Mock repository to return the test user
      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(testUser)

      await expect(
        authService.login(testUser.cpf, incorrectPassword)
      ).rejects.toThrow("Credenciais inválidas")

      expect(mockUserRepository.findByCpf).toHaveBeenCalledWith(testUser.cpf)
    })

    it("should throw error for inactive user", async () => {
      const password = "validPassword123"
      const hashedPassword = await authService.hashPassword(password)

      const inactiveUser = new User(
        "test-user-inactive",
        "11122233344",
        hashedPassword,
        "Inactive User",
        UserRole.USER,
        UserType.NAO_FIXO,
        UserStatus.INATIVO
      )

      // Mock repository to return the inactive user
      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(inactiveUser)

      await expect(
        authService.login(inactiveUser.cpf, password)
      ).rejects.toThrow("Usuário inativo")

      expect(mockUserRepository.findByCpf).toHaveBeenCalledWith(
        inactiveUser.cpf
      )
    })
  })
})
