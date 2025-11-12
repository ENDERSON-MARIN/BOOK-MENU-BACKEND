import { describe, it, expect, beforeEach, afterEach } from "vitest"
import request from "supertest"
import { app } from "../../../shared/helpers/app"
import { prisma } from "../../../../src/infrastructure/database/prisma"
import { makeAuthModule } from "../../../../src/app/modules/auth"
import { UserRole, UserStatus, UserType } from "@prisma/client"

describe("User Routes Integration Tests", () => {
  const { authService } = makeAuthModule()

  // Test user data
  const testUsers = {
    adminUser: {
      cpf: "11111111111",
      password: "admin123",
      name: "Admin User",
      role: UserRole.ADMIN,
      userType: UserType.FIXO,
      status: UserStatus.ATIVO,
    },
    activeUser: {
      cpf: "22222222222",
      password: "user123",
      name: "Active User",
      role: UserRole.USER,
      userType: UserType.NAO_FIXO,
      status: UserStatus.ATIVO,
    },
    inactiveUser: {
      cpf: "33333333333",
      password: "inactive123",
      name: "Inactive User",
      role: UserRole.USER,
      userType: UserType.NAO_FIXO,
      status: UserStatus.INATIVO,
    },
  }

  let adminToken: string
  let activeUserId: string
  let inactiveUserId: string

  beforeEach(async () => {
    // Clean database
    await prisma.reservation.deleteMany()
    await prisma.menuComposition.deleteMany()
    await prisma.menuVariation.deleteMany()
    await prisma.menu.deleteMany()
    await prisma.menuItem.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()

    // Create test users with hashed passwords
    const hashedAdminPassword = await authService.hashPassword(
      testUsers.adminUser.password
    )
    const hashedUserPassword = await authService.hashPassword(
      testUsers.activeUser.password
    )
    const hashedInactivePassword = await authService.hashPassword(
      testUsers.inactiveUser.password
    )

    const adminUser = await prisma.user.create({
      data: {
        ...testUsers.adminUser,
        password: hashedAdminPassword,
      },
    })

    const activeUser = await prisma.user.create({
      data: {
        ...testUsers.activeUser,
        password: hashedUserPassword,
      },
    })
    activeUserId = activeUser.id

    const inactiveUser = await prisma.user.create({
      data: {
        ...testUsers.inactiveUser,
        password: hashedInactivePassword,
      },
    })
    inactiveUserId = inactiveUser.id

    // Get admin token
    const loginResponse = await request(app)
      .post("/api/lunch-reservation/auth/login")
      .send({
        cpf: testUsers.adminUser.cpf,
        password: testUsers.adminUser.password,
      })
    adminToken = loginResponse.body.token
  })

  afterEach(async () => {
    // Clean up
    await prisma.reservation.deleteMany()
    await prisma.menuComposition.deleteMany()
    await prisma.menuVariation.deleteMany()
    await prisma.menu.deleteMany()
    await prisma.menuItem.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
  })

  describe("DELETE /api/lunch-reservation/users/:id", () => {
    it("should return 204 and change user status to INATIVO in database", async () => {
      // Act
      const response = await request(app)
        .delete(`/api/lunch-reservation/users/${activeUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204)

      // Assert - verify response
      expect(response.body).toEqual({})

      // Assert - verify database
      const userInDb = await prisma.user.findUnique({
        where: { id: activeUserId },
      })
      expect(userInDb).toBeDefined()
      expect(userInDb?.status).toBe(UserStatus.INATIVO)
    })

    it("should return 404 when user does not exist", async () => {
      // Arrange
      const nonExistentId = "00000000-0000-0000-0000-000000000000"

      // Act
      const response = await request(app)
        .delete(`/api/lunch-reservation/users/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)

      // Assert
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toBe("Usuário não encontrado")
    })

    it("should return 400 when user is already inactive", async () => {
      // Act
      const response = await request(app)
        .delete(`/api/lunch-reservation/users/${inactiveUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)

      // Assert
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toBe("Usuário já está inativo")
    })

    it("should preserve user reservations after soft delete", async () => {
      // Arrange - Create menu and reservation for the user
      const weekDay = await prisma.weekDay.findFirst()
      const category = await prisma.category.create({
        data: {
          name: "Test Category",
          description: "Test Description",
          displayOrder: 1,
        },
      })
      const menuItem = await prisma.menuItem.create({
        data: {
          name: "Test Item",
          description: "Test Description",
          categoryId: category.id,
        },
      })
      const menu = await prisma.menu.create({
        data: {
          date: new Date("2025-11-15"),
          dayOfWeek: weekDay?.dayOfWeek || "MONDAY",
          weekNumber: 46,
        },
      })
      await prisma.menuComposition.create({
        data: {
          menuId: menu.id,
          menuItemId: menuItem.id,
          isMainProtein: true,
        },
      })
      const menuVariation = await prisma.menuVariation.create({
        data: {
          menuId: menu.id,
          variationType: "STANDARD",
          proteinItemId: menuItem.id,
          isDefault: true,
        },
      })
      const reservation = await prisma.reservation.create({
        data: {
          userId: activeUserId,
          menuId: menu.id,
          menuVariationId: menuVariation.id,
          reservationDate: new Date("2025-11-15"),
        },
      })

      // Act - Soft delete the user
      await request(app)
        .delete(`/api/lunch-reservation/users/${activeUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204)

      // Assert - Verify reservation still exists
      const reservationInDb = await prisma.reservation.findUnique({
        where: { id: reservation.id },
      })
      expect(reservationInDb).toBeDefined()
      expect(reservationInDb?.userId).toBe(activeUserId)
      expect(reservationInDb?.status).toBe("ACTIVE")
    })
  })

  describe("GET /api/lunch-reservation/users", () => {
    it("should return only active users by default", async () => {
      // Act
      const response = await request(app)
        .get("/api/lunch-reservation/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)

      // Assert
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(2) // admin + active user

      // Verify all returned users are active
      const allActive = response.body.every(
        (user: any) => user.status === UserStatus.ATIVO
      )
      expect(allActive).toBe(true)

      // Verify inactive user is not in the list
      const hasInactiveUser = response.body.some(
        (user: any) => user.id === inactiveUserId
      )
      expect(hasInactiveUser).toBe(false)

      // Verify passwords are not included
      const hasPassword = response.body.some((user: any) =>
        user.hasOwnProperty("password")
      )
      expect(hasPassword).toBe(false)
    })

    it("should return all users including inactive when includeInactive=true", async () => {
      // Act
      const response = await request(app)
        .get("/api/lunch-reservation/users?includeInactive=true")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)

      // Assert
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(3) // admin + active + inactive

      // Verify inactive user is in the list
      const inactiveUserInList = response.body.find(
        (user: any) => user.id === inactiveUserId
      )
      expect(inactiveUserInList).toBeDefined()
      expect(inactiveUserInList.status).toBe(UserStatus.INATIVO)

      // Verify active users are also in the list
      const activeUsers = response.body.filter(
        (user: any) => user.status === UserStatus.ATIVO
      )
      expect(activeUsers.length).toBe(2)

      // Verify passwords are not included
      const hasPassword = response.body.some((user: any) =>
        user.hasOwnProperty("password")
      )
      expect(hasPassword).toBe(false)
    })
  })

  describe("POST /api/lunch-reservation/auth/login - Inactive User Authentication", () => {
    it("should return 403 when inactive user tries to login", async () => {
      // Act
      const response = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send({
          cpf: testUsers.inactiveUser.cpf,
          password: testUsers.inactiveUser.password,
        })
        .expect(403)

      // Assert
      expect(response.body).toHaveProperty("error")
      expect(response.body.error).toBe("Usuário inativo")
      expect(response.body).not.toHaveProperty("token")
    })

    it("should return 200 with token when active user logs in", async () => {
      // Act
      const response = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send({
          cpf: testUsers.activeUser.cpf,
          password: testUsers.activeUser.password,
        })
        .expect(200)

      // Assert
      expect(response.body).toHaveProperty("token")
      expect(response.body).toHaveProperty("user")
      expect(typeof response.body.token).toBe("string")
      expect(response.body.token.length).toBeGreaterThan(0)
      expect(response.body.user.cpf).toBe(testUsers.activeUser.cpf)
      expect(response.body.user.name).toBe(testUsers.activeUser.name)
      expect(response.body.user.role).toBe(testUsers.activeUser.role)
    })
  })

  describe("PUT /api/lunch-reservation/users/:id - User Reactivation", () => {
    it("should reactivate inactive user by changing status from INATIVO to ATIVO", async () => {
      // Arrange - Verify user is inactive
      const userBeforeUpdate = await prisma.user.findUnique({
        where: { id: inactiveUserId },
      })
      expect(userBeforeUpdate?.status).toBe(UserStatus.INATIVO)

      // Act - Update user status to ATIVO
      const response = await request(app)
        .put(`/api/lunch-reservation/users/${inactiveUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: testUsers.inactiveUser.name,
          status: UserStatus.ATIVO,
        })
        .expect(200)

      // Assert - Verify response
      expect(response.body).toHaveProperty("id", inactiveUserId)
      expect(response.body).toHaveProperty("status", UserStatus.ATIVO)
      expect(response.body).toHaveProperty("name", testUsers.inactiveUser.name)

      // Assert - Verify database
      const userAfterUpdate = await prisma.user.findUnique({
        where: { id: inactiveUserId },
      })
      expect(userAfterUpdate?.status).toBe(UserStatus.ATIVO)
    })

    it("should allow reactivated user to login successfully", async () => {
      // Arrange - Reactivate the inactive user
      await request(app)
        .put(`/api/lunch-reservation/users/${inactiveUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: testUsers.inactiveUser.name,
          status: UserStatus.ATIVO,
        })
        .expect(200)

      // Act - Try to login with reactivated user
      const loginResponse = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send({
          cpf: testUsers.inactiveUser.cpf,
          password: testUsers.inactiveUser.password,
        })
        .expect(200)

      // Assert - Verify login was successful
      expect(loginResponse.body).toHaveProperty("token")
      expect(loginResponse.body).toHaveProperty("user")
      expect(typeof loginResponse.body.token).toBe("string")
      expect(loginResponse.body.token.length).toBeGreaterThan(0)
      expect(loginResponse.body.user.cpf).toBe(testUsers.inactiveUser.cpf)
      expect(loginResponse.body.user.name).toBe(testUsers.inactiveUser.name)

      // Verify user is actually active in database
      const userInDb = await prisma.user.findUnique({
        where: { id: inactiveUserId },
      })
      expect(userInDb?.status).toBe(UserStatus.ATIVO)
    })

    it("should preserve reservation history after user reactivation", async () => {
      // Arrange - Create reservation for inactive user
      const weekDay = await prisma.weekDay.findFirst()
      const category = await prisma.category.create({
        data: {
          name: "Reactivation Test Category",
          description: "Test Description",
          displayOrder: 1,
        },
      })
      const menuItem = await prisma.menuItem.create({
        data: {
          name: "Reactivation Test Item",
          description: "Test Description",
          categoryId: category.id,
        },
      })
      const menu = await prisma.menu.create({
        data: {
          date: new Date("2025-11-20"),
          dayOfWeek: weekDay?.dayOfWeek || "MONDAY",
          weekNumber: 47,
        },
      })
      await prisma.menuComposition.create({
        data: {
          menuId: menu.id,
          menuItemId: menuItem.id,
          isMainProtein: true,
        },
      })
      const menuVariation = await prisma.menuVariation.create({
        data: {
          menuId: menu.id,
          variationType: "STANDARD",
          proteinItemId: menuItem.id,
          isDefault: true,
        },
      })
      const reservation = await prisma.reservation.create({
        data: {
          userId: inactiveUserId,
          menuId: menu.id,
          menuVariationId: menuVariation.id,
          reservationDate: new Date("2025-11-20"),
        },
      })

      // Act - Reactivate user
      await request(app)
        .put(`/api/lunch-reservation/users/${inactiveUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: testUsers.inactiveUser.name,
          status: UserStatus.ATIVO,
        })
        .expect(200)

      // Assert - Verify reservation history is preserved
      const reservationInDb = await prisma.reservation.findUnique({
        where: { id: reservation.id },
        include: {
          user: true,
        },
      })
      expect(reservationInDb).toBeDefined()
      expect(reservationInDb?.userId).toBe(inactiveUserId)
      expect(reservationInDb?.user.status).toBe(UserStatus.ATIVO)
      expect(reservationInDb?.status).toBe("ACTIVE")

      // Verify user can be found with their reservations
      const userWithReservations = await prisma.user.findUnique({
        where: { id: inactiveUserId },
        include: {
          reservations: true,
        },
      })
      expect(userWithReservations?.reservations.length).toBeGreaterThan(0)
      expect(userWithReservations?.reservations[0].id).toBe(reservation.id)
    })
  })
})
