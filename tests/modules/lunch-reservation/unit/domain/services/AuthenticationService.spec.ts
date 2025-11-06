import { describe, it, expect, beforeEach, vi } from "vitest"
import { AuthenticationService } from "../../../../../../src/app/modules/lunch-reservation/domain/services/AuthenticationService"
import { UserRepository } from "../../../../../../src/app/modules/lunch-reservation/domain/repositories/UserRepository"
import {
  User,
  UserRole,
  UserType,
  UserStatus,
} from "../../../../../../src/app/modules/lunch-reservation/domain/entities/User"
import { AppError } from "../../../../../../src/app/shared"

// Mock do repositório
const mockUserRepository: UserRepository = {
  findByCpf: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn(),
}

describe("AuthenticationService", () => {
  let service: AuthenticationService

  beforeEach(() => {
    service = new AuthenticationService(mockUserRepository)
    vi.clearAllMocks()
  })

  describe("login", () => {
    const validUser = new User(
      "123",
      "11144477735", // Valid CPF
      "hashedPassword123",
      "João Silva",
      UserRole.USER,
      UserType.FIXO,
      UserStatus.ATIVO,
      new Date(),
      new Date()
    )

    it("should authenticate user with valid credentials", async () => {
      const credentials = {
        cpf: "11144477735", // Valid CPF
        password: "password123",
      }

      // Mock password hash to match
      const hashedPassword = service.hashPassword(credentials.password)
      const userWithHashedPassword = new User(
        validUser.id,
        credentials.cpf,
        hashedPassword,
        validUser.name,
        validUser.role,
        validUser.userType,
        validUser.status,
        validUser.createdAt,
        validUser.updatedAt
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(
        userWithHashedPassword
      )

      const result = await service.login(credentials)

      expect(mockUserRepository.findByCpf).toHaveBeenCalledWith(credentials.cpf)
      expect(result).toHaveProperty("user")
      expect(result).toHaveProperty("token")
      expect(result.user.cpf).toBe(credentials.cpf)
      expect(typeof result.token).toBe("string")
    })

    it("should throw error for invalid CPF format", async () => {
      const credentials = {
        cpf: "123456789", // Invalid CPF
        password: "password123",
      }

      await expect(service.login(credentials)).rejects.toThrow(AppError)
      await expect(service.login(credentials)).rejects.toThrow("CPF inválido")
      expect(mockUserRepository.findByCpf).not.toHaveBeenCalled()
    })

    it("should throw error for non-existent user", async () => {
      const credentials = {
        cpf: "11144477735", // Valid CPF
        password: "password123",
      }

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(null)

      await expect(service.login(credentials)).rejects.toThrow(AppError)
      await expect(service.login(credentials)).rejects.toThrow(
        "Credenciais inválidas"
      )
    })

    it("should throw error for inactive user", async () => {
      const credentials = {
        cpf: "11144477735", // Valid CPF
        password: "password123",
      }

      const inactiveUser = new User(
        validUser.id,
        credentials.cpf,
        validUser.password,
        validUser.name,
        validUser.role,
        validUser.userType,
        UserStatus.INATIVO,
        validUser.createdAt,
        validUser.updatedAt
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(inactiveUser)

      await expect(service.login(credentials)).rejects.toThrow(AppError)
      await expect(service.login(credentials)).rejects.toThrow(
        "Usuário inativo"
      )
    })

    it("should throw error for invalid password", async () => {
      const credentials = {
        cpf: "11144477735", // Valid CPF
        password: "wrongPassword",
      }

      const hashedPassword = service.hashPassword("correctPassword")
      const userWithHashedPassword = new User(
        validUser.id,
        credentials.cpf,
        hashedPassword,
        validUser.name,
        validUser.role,
        validUser.userType,
        validUser.status,
        validUser.createdAt,
        validUser.updatedAt
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(
        userWithHashedPassword
      )

      await expect(service.login(credentials)).rejects.toThrow(AppError)
      await expect(service.login(credentials)).rejects.toThrow(
        "Credenciais inválidas"
      )
    })

    it("should generate valid JWT token", async () => {
      const credentials = {
        cpf: "11144477735", // Valid CPF
        password: "password123",
      }

      const hashedPassword = service.hashPassword(credentials.password)
      const userWithHashedPassword = new User(
        validUser.id,
        credentials.cpf,
        hashedPassword,
        validUser.name,
        validUser.role,
        validUser.userType,
        validUser.status,
        validUser.createdAt,
        validUser.updatedAt
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(
        userWithHashedPassword
      )

      const result = await service.login(credentials)

      expect(result.token).toBeDefined()
      expect(result.token.split(".")).toHaveLength(3) // JWT has 3 parts
    })
  })

  describe("validateToken", () => {
    const validUser = new User(
      "123",
      "11144477735", // Valid CPF
      "hashedPassword123",
      "João Silva",
      UserRole.USER,
      UserType.FIXO,
      UserStatus.ATIVO,
      new Date(),
      new Date()
    )

    it("should validate valid token", async () => {
      const credentials = {
        cpf: "11144477735", // Valid CPF
        password: "password123",
      }

      const hashedPassword = service.hashPassword(credentials.password)
      const userWithHashedPassword = new User(
        validUser.id,
        credentials.cpf,
        hashedPassword,
        validUser.name,
        validUser.role,
        validUser.userType,
        validUser.status,
        validUser.createdAt,
        validUser.updatedAt
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(
        userWithHashedPassword
      )
      vi.mocked(mockUserRepository.findById).mockResolvedValue(
        userWithHashedPassword
      )

      const loginResult = await service.login(credentials)
      const payload = await service.validateToken(loginResult.token)

      expect(payload).toHaveProperty("userId")
      expect(payload).toHaveProperty("cpf")
      expect(payload).toHaveProperty("role")
      expect(payload).toHaveProperty("userType")
      expect(payload.userId).toBe(validUser.id)
      expect(payload.cpf).toBe(credentials.cpf)
    })

    it("should throw error for invalid token format", async () => {
      const invalidToken = "invalid.token"

      await expect(service.validateToken(invalidToken)).rejects.toThrow(
        AppError
      )
      await expect(service.validateToken(invalidToken)).rejects.toThrow(
        "Token inválido"
      )
    })

    it("should throw error for token with invalid signature", async () => {
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJjcGYiOiIxMTEiLCJyb2xlIjoiVVNFUiIsInVzZXJUeXBlIjoiRklYTyJ9.invalid_signature"

      await expect(service.validateToken(invalidToken)).rejects.toThrow(
        AppError
      )
      await expect(service.validateToken(invalidToken)).rejects.toThrow(
        "Token inválido"
      )
    })

    it("should throw error for token of inactive user", async () => {
      const credentials = {
        cpf: "11144477735", // Valid CPF
        password: "password123",
      }

      const hashedPassword = service.hashPassword(credentials.password)
      const activeUser = new User(
        validUser.id,
        credentials.cpf,
        hashedPassword,
        validUser.name,
        validUser.role,
        validUser.userType,
        UserStatus.ATIVO,
        validUser.createdAt,
        validUser.updatedAt
      )

      const inactiveUser = new User(
        validUser.id,
        credentials.cpf,
        hashedPassword,
        validUser.name,
        validUser.role,
        validUser.userType,
        UserStatus.INATIVO,
        validUser.createdAt,
        validUser.updatedAt
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(activeUser)
      vi.mocked(mockUserRepository.findById).mockResolvedValue(inactiveUser)

      const loginResult = await service.login(credentials)

      await expect(service.validateToken(loginResult.token)).rejects.toThrow(
        AppError
      )
      await expect(service.validateToken(loginResult.token)).rejects.toThrow(
        "Token inválido"
      )
    })
  })

  describe("refreshToken", () => {
    it("should generate new token from valid old token", async () => {
      const credentials = {
        cpf: "11144477735", // Valid CPF
        password: "password123",
      }

      const hashedPassword = service.hashPassword(credentials.password)
      const userWithHashedPassword = new User(
        "123",
        credentials.cpf,
        hashedPassword,
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(
        userWithHashedPassword
      )
      vi.mocked(mockUserRepository.findById).mockResolvedValue(
        userWithHashedPassword
      )

      const loginResult = await service.login(credentials)

      // Mock time to be 1 second later to ensure different timestamps
      const mockDate = new Date(Date.now() + 1000)
      vi.setSystemTime(mockDate)

      const newToken = await service.refreshToken(loginResult.token)

      expect(newToken).toBeDefined()
      expect(typeof newToken).toBe("string")
      expect(newToken).not.toBe(loginResult.token)
      expect(newToken.split(".")).toHaveLength(3)

      vi.useRealTimers()
    })

    it("should throw error for invalid old token", async () => {
      const invalidToken = "invalid.token"

      await expect(service.refreshToken(invalidToken)).rejects.toThrow(AppError)
      await expect(service.refreshToken(invalidToken)).rejects.toThrow(
        "Token inválido"
      )
    })
  })

  describe("hashPassword", () => {
    it("should hash password consistently", () => {
      const password = "testPassword123"

      const hash1 = service.hashPassword(password)
      const hash2 = service.hashPassword(password)

      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(password)
      expect(typeof hash1).toBe("string")
    })

    it("should generate different hashes for different passwords", () => {
      const password1 = "password1"
      const password2 = "password2"

      const hash1 = service.hashPassword(password1)
      const hash2 = service.hashPassword(password2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("CPF validation", () => {
    it("should accept valid CPF", async () => {
      const credentials = {
        cpf: "11144477735", // Valid CPF
        password: "password123",
      }

      const hashedPassword = service.hashPassword(credentials.password)
      const validUser = new User(
        "123",
        credentials.cpf,
        hashedPassword,
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(validUser)

      const result = await service.login(credentials)

      expect(result).toHaveProperty("user")
      expect(result).toHaveProperty("token")
    })

    it("should reject CPF with all same digits", async () => {
      const credentials = {
        cpf: "11111111111",
        password: "password123",
      }

      await expect(service.login(credentials)).rejects.toThrow(AppError)
      await expect(service.login(credentials)).rejects.toThrow("CPF inválido")
    })

    it("should reject CPF with wrong length", async () => {
      const credentials = {
        cpf: "123456789",
        password: "password123",
      }

      await expect(service.login(credentials)).rejects.toThrow(AppError)
      await expect(service.login(credentials)).rejects.toThrow("CPF inválido")
    })

    it("should reject CPF with invalid check digits", async () => {
      const credentials = {
        cpf: "12345678900", // Invalid check digits
        password: "password123",
      }

      await expect(service.login(credentials)).rejects.toThrow(AppError)
      await expect(service.login(credentials)).rejects.toThrow("CPF inválido")
    })
  })
})
