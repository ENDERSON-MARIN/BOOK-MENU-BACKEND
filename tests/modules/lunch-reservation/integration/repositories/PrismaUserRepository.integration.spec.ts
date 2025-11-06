import { describe, it, expect, beforeEach } from "vitest"
import { PrismaUserRepository } from "../../../../../src/app/modules/lunch-reservation/infrastructure/repositories/PrismaUserRepository"
import {
  User,
  UserRole,
  UserType,
  UserStatus,
} from "../../../../../src/app/modules/lunch-reservation/domain/entities/User"
import {
  CreateUserDTO,
  UpdateUserDTO,
} from "../../../../../src/app/modules/lunch-reservation/dtos/UserDTOs"
import { prisma } from "../../../../../src/infrastructure/database/prisma"

describe("PrismaUserRepository Integration Tests", () => {
  let repository: PrismaUserRepository

  beforeEach(async () => {
    repository = new PrismaUserRepository(prisma)

    // Clean up tables in correct order (respecting foreign key constraints)
    await prisma.reservation.deleteMany()
    await prisma.menuVariation.deleteMany()
    await prisma.menuComposition.deleteMany()
    await prisma.menu.deleteMany()
    await prisma.menuItem.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
  })

  describe("create", () => {
    it("should create a new user with all fields", async () => {
      const userData: CreateUserDTO = {
        cpf: "11144477735",
        password: "hashedPassword123",
        name: "João Silva",
        role: UserRole.USER,
        userType: UserType.FIXO,
        status: UserStatus.ATIVO,
      }

      const createdUser = await repository.create(userData)

      expect(createdUser).toBeInstanceOf(User)
      expect(createdUser.cpf).toBe(userData.cpf)
      expect(createdUser.password).toBe(userData.password)
      expect(createdUser.name).toBe(userData.name)
      expect(createdUser.role).toBe(userData.role)
      expect(createdUser.userType).toBe(userData.userType)
      expect(createdUser.status).toBe(userData.status)
      expect(createdUser.id).toBeDefined()
      expect(createdUser.createdAt).toBeDefined()
      expect(createdUser.updatedAt).toBeDefined()
    })

    it("should create user with default values when optional fields are not provided", async () => {
      const userData: CreateUserDTO = {
        cpf: "22255588846",
        password: "hashedPassword123",
        name: "Maria Santos",
      }

      const createdUser = await repository.create(userData)

      expect(createdUser.role).toBe(UserRole.USER)
      expect(createdUser.userType).toBe(UserType.NAO_FIXO)
      expect(createdUser.status).toBe(UserStatus.ATIVO)
    })

    it("should throw error when creating user with duplicate CPF", async () => {
      const userData: CreateUserDTO = {
        cpf: "11144477735",
        password: "hashedPassword123",
        name: "João Silva",
      }

      await repository.create(userData)

      const duplicateUserData: CreateUserDTO = {
        cpf: "11144477735",
        password: "anotherPassword",
        name: "Another User",
      }

      await expect(repository.create(duplicateUserData)).rejects.toThrow()
    })
  })

  describe("findByCpf", () => {
    it("should find user by CPF", async () => {
      const userData: CreateUserDTO = {
        cpf: "11144477735",
        password: "hashedPassword123",
        name: "João Silva",
        role: UserRole.ADMIN,
        userType: UserType.FIXO,
      }

      const createdUser = await repository.create(userData)
      const foundUser = await repository.findByCpf(userData.cpf)

      expect(foundUser).not.toBeNull()
      expect(foundUser!.id).toBe(createdUser.id)
      expect(foundUser!.cpf).toBe(userData.cpf)
      expect(foundUser!.name).toBe(userData.name)
      expect(foundUser!.role).toBe(userData.role)
      expect(foundUser!.userType).toBe(userData.userType)
    })

    it("should return null when user with CPF does not exist", async () => {
      const foundUser = await repository.findByCpf("99999999999")

      expect(foundUser).toBeNull()
    })
  })

  describe("findById", () => {
    it("should find user by ID", async () => {
      const userData: CreateUserDTO = {
        cpf: "11144477735",
        password: "hashedPassword123",
        name: "João Silva",
      }

      const createdUser = await repository.create(userData)
      const foundUser = await repository.findById(createdUser.id)

      expect(foundUser).not.toBeNull()
      expect(foundUser!.id).toBe(createdUser.id)
      expect(foundUser!.cpf).toBe(userData.cpf)
      expect(foundUser!.name).toBe(userData.name)
    })

    it("should return null when user with ID does not exist", async () => {
      const foundUser = await repository.findById(
        "550e8400-e29b-41d4-a716-446655440000"
      )

      expect(foundUser).toBeNull()
    })
  })

  describe("findAll", () => {
    it("should return all users ordered by creation date (newest first)", async () => {
      const user1Data: CreateUserDTO = {
        cpf: "11144477735",
        password: "password1",
        name: "User 1",
      }

      const user2Data: CreateUserDTO = {
        cpf: "22255588846",
        password: "password2",
        name: "User 2",
      }

      const user3Data: CreateUserDTO = {
        cpf: "33366699957",
        password: "password3",
        name: "User 3",
      }

      const createdUser1 = await repository.create(user1Data)
      const createdUser2 = await repository.create(user2Data)
      const createdUser3 = await repository.create(user3Data)

      const allUsers = await repository.findAll()

      expect(allUsers).toHaveLength(3)
      // Should be ordered by creation date (newest first)
      expect(allUsers[0].id).toBe(createdUser3.id)
      expect(allUsers[1].id).toBe(createdUser2.id)
      expect(allUsers[2].id).toBe(createdUser1.id)
    })

    it("should return empty array when no users exist", async () => {
      const allUsers = await repository.findAll()

      expect(allUsers).toEqual([])
    })
  })

  describe("update", () => {
    it("should update user with provided fields", async () => {
      const userData: CreateUserDTO = {
        cpf: "11144477735",
        password: "originalPassword",
        name: "Original Name",
        role: UserRole.USER,
        userType: UserType.NAO_FIXO,
        status: UserStatus.ATIVO,
      }

      const createdUser = await repository.create(userData)

      const updateData: UpdateUserDTO = {
        name: "Updated Name",
        password: "newPassword",
        role: UserRole.ADMIN,
        userType: UserType.FIXO,
        status: UserStatus.INATIVO,
      }

      const updatedUser = await repository.update(createdUser.id, updateData)

      expect(updatedUser.id).toBe(createdUser.id)
      expect(updatedUser.cpf).toBe(userData.cpf) // CPF should not change
      expect(updatedUser.name).toBe(updateData.name)
      expect(updatedUser.password).toBe(updateData.password)
      expect(updatedUser.role).toBe(updateData.role)
      expect(updatedUser.userType).toBe(updateData.userType)
      expect(updatedUser.status).toBe(updateData.status)
      expect(updatedUser.updatedAt!.getTime()).toBeGreaterThan(
        createdUser.updatedAt!.getTime()
      )
    })

    it("should update only provided fields", async () => {
      const userData: CreateUserDTO = {
        cpf: "11144477735",
        password: "originalPassword",
        name: "Original Name",
        role: UserRole.USER,
        userType: UserType.NAO_FIXO,
      }

      const createdUser = await repository.create(userData)

      const updateData: UpdateUserDTO = {
        name: "Updated Name Only",
      }

      const updatedUser = await repository.update(createdUser.id, updateData)

      expect(updatedUser.name).toBe(updateData.name)
      expect(updatedUser.password).toBe(userData.password) // Should remain unchanged
      expect(updatedUser.role).toBe(userData.role) // Should remain unchanged
      expect(updatedUser.userType).toBe(userData.userType) // Should remain unchanged
    })

    it("should throw error when updating non-existent user", async () => {
      const updateData: UpdateUserDTO = {
        name: "Updated Name",
      }

      await expect(
        repository.update("550e8400-e29b-41d4-a716-446655440000", updateData)
      ).rejects.toThrow()
    })
  })

  describe("delete", () => {
    it("should delete user by ID", async () => {
      const userData: CreateUserDTO = {
        cpf: "11144477735",
        password: "hashedPassword123",
        name: "João Silva",
      }

      const createdUser = await repository.create(userData)

      await repository.delete(createdUser.id)

      const foundUser = await repository.findById(createdUser.id)
      expect(foundUser).toBeNull()
    })

    it("should throw error when deleting non-existent user", async () => {
      await expect(
        repository.delete("550e8400-e29b-41d4-a716-446655440000")
      ).rejects.toThrow()
    })
  })

  describe("database constraints", () => {
    it("should enforce unique CPF constraint", async () => {
      const userData1: CreateUserDTO = {
        cpf: "11144477735",
        password: "password1",
        name: "User 1",
      }

      const userData2: CreateUserDTO = {
        cpf: "11144477735", // Same CPF
        password: "password2",
        name: "User 2",
      }

      await repository.create(userData1)

      await expect(repository.create(userData2)).rejects.toThrow()
    })

    it("should handle concurrent user creation", async () => {
      const userPromises = Array.from({ length: 3 }, (_, i) =>
        repository.create({
          cpf: `1114447773${i}`,
          password: `password${i}`,
          name: `User ${i}`,
        })
      )

      const users = await Promise.all(userPromises)

      expect(users).toHaveLength(3)
      users.forEach((user, index) => {
        expect(user.cpf).toBe(`1114447773${index}`)
        expect(user.name).toBe(`User ${index}`)
      })
    })
  })
})
