import { describe, it, expect, beforeEach, vi } from "vitest"
import { UserManagementService } from "../../../../../../src/app/modules/lunch-reservation/domain/services/UserManagementService"
import { UserRepository } from "../../../../../../src/app/modules/lunch-reservation/domain/repositories/UserRepository"
import {
  User,
  UserRole,
  UserType,
  UserStatus,
} from "../../../../../../src/app/modules/lunch-reservation/domain/entities/User"
import {
  CreateUserDTO,
  UpdateUserDTO,
} from "../../../../../../src/app/modules/lunch-reservation/dtos/UserDTOs"
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

// Mock do AuthService
interface MockAuthService {
  hashPassword: (password: string) => Promise<string>
  comparePassword: (password: string, hash: string) => Promise<boolean>
  generateToken: (user: User) => string
  validateToken: (
    token: string
  ) => Promise<{ userId: string; cpf: string; role: string }>
  login: (
    cpf: string,
    password: string
  ) => Promise<{
    token: string
    user: { id: string; cpf: string; name: string; role: string }
  }>
}

const mockAuthenticationService: MockAuthService = {
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  generateToken: vi.fn(),
  validateToken: vi.fn(),
  login: vi.fn(),
}

describe("UserManagementService", () => {
  let service: UserManagementService

  beforeEach(() => {
    service = new UserManagementService(
      mockUserRepository,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockAuthenticationService as any
    )
    vi.clearAllMocks()
  })

  describe("create", () => {
    const createUserDTO: CreateUserDTO = {
      cpf: "11144477735",
      password: "password123",
      name: "João Silva",
      role: UserRole.USER,
      userType: UserType.FIXO,
    }

    it("should create a new user with valid data", async () => {
      const hashedPassword = "hashedPassword123"
      const createdUser = new User(
        "123",
        createUserDTO.cpf,
        hashedPassword,
        createUserDTO.name,
        createUserDTO.role!,
        createUserDTO.userType!,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(null)
      vi.mocked(mockAuthenticationService.hashPassword).mockResolvedValue(
        hashedPassword
      )
      vi.mocked(mockUserRepository.create).mockResolvedValue(createdUser)

      const result = await service.create(createUserDTO)

      expect(mockUserRepository.findByCpf).toHaveBeenCalledWith(
        createUserDTO.cpf
      )
      expect(mockAuthenticationService.hashPassword).toHaveBeenCalledWith(
        createUserDTO.password
      )
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDTO,
        password: hashedPassword,
      })
      expect(result).toEqual(createdUser)
    })

    it("should throw error if CPF already exists", async () => {
      const existingUser = new User(
        "456",
        createUserDTO.cpf,
        "hashedPassword",
        "Existing User",
        UserRole.USER,
        UserType.NAO_FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(existingUser)

      await expect(service.create(createUserDTO)).rejects.toThrow(AppError)
      await expect(service.create(createUserDTO)).rejects.toThrow(
        "Usuário com este CPF já existe"
      )
      expect(mockUserRepository.create).not.toHaveBeenCalled()
    })

    it("should throw error for invalid CPF format", async () => {
      const invalidCpfDTO = {
        ...createUserDTO,
        cpf: "12345678900", // Invalid CPF
      }

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(null)

      await expect(service.create(invalidCpfDTO)).rejects.toThrow(AppError)
      await expect(service.create(invalidCpfDTO)).rejects.toThrow(
        "CPF inválido"
      )
      expect(mockUserRepository.create).not.toHaveBeenCalled()
    })

    it("should hash password before creating user", async () => {
      const hashedPassword = "hashedPassword123"
      const createdUser = new User(
        "123",
        createUserDTO.cpf,
        hashedPassword,
        createUserDTO.name,
        createUserDTO.role!,
        createUserDTO.userType!,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findByCpf).mockResolvedValue(null)
      vi.mocked(mockAuthenticationService.hashPassword).mockResolvedValue(
        hashedPassword
      )
      vi.mocked(mockUserRepository.create).mockResolvedValue(createdUser)

      await service.create(createUserDTO)

      expect(mockAuthenticationService.hashPassword).toHaveBeenCalledWith(
        createUserDTO.password
      )
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDTO,
        password: hashedPassword,
      })
    })
  })

  describe("findAll", () => {
    it("should return all users", async () => {
      const users = [
        new User(
          "1",
          "11144477735",
          "hash1",
          "User 1",
          UserRole.USER,
          UserType.FIXO,
          UserStatus.ATIVO,
          new Date(),
          new Date()
        ),
        new User(
          "2",
          "22255588846",
          "hash2",
          "User 2",
          UserRole.ADMIN,
          UserType.NAO_FIXO,
          UserStatus.INATIVO,
          new Date(),
          new Date()
        ),
      ]

      vi.mocked(mockUserRepository.findAll).mockResolvedValue(users)

      const result = await service.findAll()

      expect(mockUserRepository.findAll).toHaveBeenCalled()
      expect(result).toEqual(users)
      expect(result).toHaveLength(2)
    })

    it("should return empty array when no users exist", async () => {
      vi.mocked(mockUserRepository.findAll).mockResolvedValue([])

      const result = await service.findAll()

      expect(result).toEqual([])
    })
  })

  describe("findById", () => {
    it("should return user by id", async () => {
      const user = new User(
        "123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(user)

      const result = await service.findById("123")

      expect(mockUserRepository.findById).toHaveBeenCalledWith("123")
      expect(result).toEqual(user)
    })

    it("should throw error if user not found", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      await expect(service.findById("999")).rejects.toThrow(AppError)
      await expect(service.findById("999")).rejects.toThrow(
        "Usuário não encontrado"
      )
    })
  })

  describe("update", () => {
    const updateUserDTO: UpdateUserDTO = {
      name: "João Silva Updated",
      userType: UserType.NAO_FIXO,
    }

    it("should update user with valid data", async () => {
      const existingUser = new User(
        "123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      const updatedUser = new User(
        "123",
        "11144477735",
        "hashedPassword",
        updateUserDTO.name!,
        UserRole.USER,
        updateUserDTO.userType!,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(existingUser)
      vi.mocked(mockUserRepository.update).mockResolvedValue(updatedUser)

      const result = await service.update("123", updateUserDTO)

      expect(mockUserRepository.findById).toHaveBeenCalledWith("123")
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        "123",
        updateUserDTO
      )
      expect(result).toEqual(updatedUser)
    })

    it("should hash password when updating password", async () => {
      const existingUser = new User(
        "123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      const updateWithPassword: UpdateUserDTO = {
        ...updateUserDTO,
        password: "newPassword123",
      }

      const hashedNewPassword = "hashedNewPassword123"
      const updatedUser = new User(
        "123",
        "11144477735",
        hashedNewPassword,
        updateUserDTO.name!,
        UserRole.USER,
        updateUserDTO.userType!,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(existingUser)
      vi.mocked(mockAuthenticationService.hashPassword).mockResolvedValue(
        hashedNewPassword
      )
      vi.mocked(mockUserRepository.update).mockResolvedValue(updatedUser)

      await service.update("123", updateWithPassword)

      expect(mockAuthenticationService.hashPassword).toHaveBeenCalledWith(
        "newPassword123"
      )
      expect(mockUserRepository.update).toHaveBeenCalledWith("123", {
        ...updateUserDTO,
        password: hashedNewPassword,
      })
    })

    it("should throw error if user not found", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      await expect(service.update("999", updateUserDTO)).rejects.toThrow(
        AppError
      )
      await expect(service.update("999", updateUserDTO)).rejects.toThrow(
        "Usuário não encontrado"
      )
      expect(mockUserRepository.update).not.toHaveBeenCalled()
    })
  })

  describe("toggleStatus", () => {
    it("should toggle user status from ATIVO to INATIVO", async () => {
      const activeUser = new User(
        "123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      const inactiveUser = new User(
        "123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.INATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(activeUser)
      vi.mocked(mockUserRepository.update).mockResolvedValue(inactiveUser)

      const result = await service.toggleStatus("123")

      expect(mockUserRepository.findById).toHaveBeenCalledWith("123")
      expect(mockUserRepository.update).toHaveBeenCalledWith("123", {
        status: UserStatus.INATIVO,
      })
      expect(result.status).toBe(UserStatus.INATIVO)
    })

    it("should toggle user status from INATIVO to ATIVO", async () => {
      const inactiveUser = new User(
        "123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.INATIVO,
        new Date(),
        new Date()
      )

      const activeUser = new User(
        "123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(inactiveUser)
      vi.mocked(mockUserRepository.update).mockResolvedValue(activeUser)

      const result = await service.toggleStatus("123")

      expect(result.status).toBe(UserStatus.ATIVO)
    })

    it("should throw error if user not found", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      await expect(service.toggleStatus("999")).rejects.toThrow(AppError)
      await expect(service.toggleStatus("999")).rejects.toThrow(
        "Usuário não encontrado"
      )
      expect(mockUserRepository.update).not.toHaveBeenCalled()
    })
  })

  describe("changeUserType", () => {
    it("should change user type from FIXO to NAO_FIXO", async () => {
      const fixedUser = new User(
        "123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      const nonFixedUser = new User(
        "123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.NAO_FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(fixedUser)
      vi.mocked(mockUserRepository.update).mockResolvedValue(nonFixedUser)

      const result = await service.changeUserType("123", UserType.NAO_FIXO)

      expect(mockUserRepository.update).toHaveBeenCalledWith("123", {
        userType: UserType.NAO_FIXO,
      })
      expect(result.userType).toBe(UserType.NAO_FIXO)
    })

    it("should throw error if user already has the same type", async () => {
      const fixedUser = new User(
        "123",
        "11144477735",
        "hashedPassword",
        "João Silva",
        UserRole.USER,
        UserType.FIXO,
        UserStatus.ATIVO,
        new Date(),
        new Date()
      )

      vi.mocked(mockUserRepository.findById).mockResolvedValue(fixedUser)

      await expect(
        service.changeUserType("123", UserType.FIXO)
      ).rejects.toThrow(AppError)
      await expect(
        service.changeUserType("123", UserType.FIXO)
      ).rejects.toThrow("Usuário já possui este tipo")
      expect(mockUserRepository.update).not.toHaveBeenCalled()
    })

    it("should throw error if user not found", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      await expect(
        service.changeUserType("999", UserType.NAO_FIXO)
      ).rejects.toThrow(AppError)
      await expect(
        service.changeUserType("999", UserType.NAO_FIXO)
      ).rejects.toThrow("Usuário não encontrado")
    })
  })

  describe("getActiveUsers", () => {
    it("should return only active users", async () => {
      const users = [
        new User(
          "1",
          "11144477735",
          "hash1",
          "User 1",
          UserRole.USER,
          UserType.FIXO,
          UserStatus.ATIVO,
          new Date(),
          new Date()
        ),
        new User(
          "2",
          "22255588846",
          "hash2",
          "User 2",
          UserRole.USER,
          UserType.NAO_FIXO,
          UserStatus.INATIVO,
          new Date(),
          new Date()
        ),
        new User(
          "3",
          "33366699957",
          "hash3",
          "User 3",
          UserRole.ADMIN,
          UserType.FIXO,
          UserStatus.ATIVO,
          new Date(),
          new Date()
        ),
      ]

      vi.mocked(mockUserRepository.findAll).mockResolvedValue(users)

      const result = await service.getActiveUsers()

      expect(result).toHaveLength(2)
      expect(result.every((user) => user.status === UserStatus.ATIVO)).toBe(
        true
      )
    })
  })

  describe("getFixedUsers", () => {
    it("should return only active fixed users", async () => {
      const users = [
        new User(
          "1",
          "11144477735",
          "hash1",
          "User 1",
          UserRole.USER,
          UserType.FIXO,
          UserStatus.ATIVO,
          new Date(),
          new Date()
        ),
        new User(
          "2",
          "22255588846",
          "hash2",
          "User 2",
          UserRole.USER,
          UserType.NAO_FIXO,
          UserStatus.ATIVO,
          new Date(),
          new Date()
        ),
        new User(
          "3",
          "33366699957",
          "hash3",
          "User 3",
          UserRole.USER,
          UserType.FIXO,
          UserStatus.INATIVO,
          new Date(),
          new Date()
        ),
      ]

      vi.mocked(mockUserRepository.findAll).mockResolvedValue(users)

      const result = await service.getFixedUsers()

      expect(result).toHaveLength(1)
      expect(result[0].userType).toBe(UserType.FIXO)
      expect(result[0].status).toBe(UserStatus.ATIVO)
    })
  })

  describe("getNonFixedUsers", () => {
    it("should return only active non-fixed users", async () => {
      const users = [
        new User(
          "1",
          "11144477735",
          "hash1",
          "User 1",
          UserRole.USER,
          UserType.FIXO,
          UserStatus.ATIVO,
          new Date(),
          new Date()
        ),
        new User(
          "2",
          "22255588846",
          "hash2",
          "User 2",
          UserRole.USER,
          UserType.NAO_FIXO,
          UserStatus.ATIVO,
          new Date(),
          new Date()
        ),
        new User(
          "3",
          "33366699957",
          "hash3",
          "User 3",
          UserRole.USER,
          UserType.NAO_FIXO,
          UserStatus.INATIVO,
          new Date(),
          new Date()
        ),
      ]

      vi.mocked(mockUserRepository.findAll).mockResolvedValue(users)

      const result = await service.getNonFixedUsers()

      expect(result).toHaveLength(1)
      expect(result[0].userType).toBe(UserType.NAO_FIXO)
      expect(result[0].status).toBe(UserStatus.ATIVO)
    })
  })

  describe("getAdminUsers", () => {
    it("should return only active admin users", async () => {
      const users = [
        new User(
          "1",
          "11144477735",
          "hash1",
          "User 1",
          UserRole.USER,
          UserType.FIXO,
          UserStatus.ATIVO,
          new Date(),
          new Date()
        ),
        new User(
          "2",
          "22255588846",
          "hash2",
          "Admin 1",
          UserRole.ADMIN,
          UserType.NAO_FIXO,
          UserStatus.ATIVO,
          new Date(),
          new Date()
        ),
        new User(
          "3",
          "33366699957",
          "hash3",
          "Admin 2",
          UserRole.ADMIN,
          UserType.FIXO,
          UserStatus.INATIVO,
          new Date(),
          new Date()
        ),
      ]

      vi.mocked(mockUserRepository.findAll).mockResolvedValue(users)

      const result = await service.getAdminUsers()

      expect(result).toHaveLength(1)
      expect(result[0].role).toBe(UserRole.ADMIN)
      expect(result[0].status).toBe(UserStatus.ATIVO)
    })
  })
})
