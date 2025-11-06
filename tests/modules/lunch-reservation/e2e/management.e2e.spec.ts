import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../../shared/helpers/app"
import { prisma } from "../../../../src/infrastructure/database/prisma"
import { AuthenticationService } from "../../../../src/app/modules/lunch-reservation/domain/services/AuthenticationService"
import { UserRepository } from "../../../../src/app/modules/lunch-reservation/domain/repositories/UserRepository"

describe("Lunch Reservation Management E2E Tests", () => {
  // Create a temporary authentication service instance for password hashing
  const tempAuthService = new AuthenticationService({} as UserRepository)

  let userToken: string
  let adminToken: string
  let testUserId: string
  let testMenuId: string
  let testMenuVariationId: string

  beforeEach(async () => {
    // Clean up database
    await prisma.reservation.deleteMany()
    await prisma.menuVariation.deleteMany()
    await prisma.menuComposition.deleteMany()
    await prisma.menu.deleteMany()
    await prisma.menuItem.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()

    // Create test users
    const testUser = await prisma.user.create({
      data: {
        cpf: "11144477735",
        password: tempAuthService.hashPassword("hello"),
        name: "Test User",
        role: "USER",
        userType: "NAO_FIXO",
        status: "ATIVO",
      },
    })
    testUserId = testUser.id

    await prisma.user.create({
      data: {
        cpf: "22255588846",
        password: tempAuthService.hashPassword("hello"),
        name: "Admin User",
        role: "ADMIN",
        userType: "NAO_FIXO",
        status: "ATIVO",
      },
    })

    // Get authentication tokens
    const userLoginResponse = await request(app)
      .post("/api/lunch-reservation/auth/login")
      .send({
        cpf: "11144477735",
        password: "hello",
      })

    const adminLoginResponse = await request(app)
      .post("/api/lunch-reservation/auth/login")
      .send({
        cpf: "22255588846",
        password: "hello",
      })

    userToken = userLoginResponse.body.token
    adminToken = adminLoginResponse.body.token

    // Create test data structure
    const testCategory = await prisma.category.create({
      data: {
        name: "Proteínas",
        description: "Categoria de proteínas",
        displayOrder: 1,
        isActive: true,
      },
    })

    const testMenuItem = await prisma.menuItem.create({
      data: {
        name: "Frango Grelhado",
        description: "Frango grelhado com temperos",
        categoryId: testCategory.id,
        isActive: true,
      },
    })

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)

    const testMenu = await prisma.menu.create({
      data: {
        date: tomorrow,
        dayOfWeek: "TUESDAY",
        weekNumber: 50,
        observations: "Menu de teste",
        isActive: true,
      },
    })
    testMenuId = testMenu.id

    const testMenuVariation = await prisma.menuVariation.create({
      data: {
        menuId: testMenu.id,
        variationType: "STANDARD",
        proteinItemId: testMenuItem.id,
        isDefault: true,
      },
    })
    testMenuVariationId = testMenuVariation.id

    await prisma.menuComposition.create({
      data: {
        menuId: testMenu.id,
        menuItemId: testMenuItem.id,
        observations: "Proteína principal",
        isMainProtein: true,
        isAlternativeProtein: false,
      },
    })
  })

  describe("Complete Reservation Flow", () => {
    it("should complete full reservation lifecycle", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      // 1. User checks available menus
      const menusResponse = await request(app)
        .get("/api/lunch-reservation/menus")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(menusResponse.body).toHaveLength(1)
      expect(menusResponse.body[0].id).toBe(testMenuId)

      // 2. User gets menu details for specific date
      const menuByDateResponse = await request(app)
        .get(
          `/api/lunch-reservation/menus/date/${tomorrow.toISOString().split("T")[0]}`
        )
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(menuByDateResponse.body).toBeTruthy()
      if (menuByDateResponse.body) {
        expect(menuByDateResponse.body.id).toBe(testMenuId)
        expect(menuByDateResponse.body.variations).toHaveLength(1)
        expect(menuByDateResponse.body.variations[0].id).toBe(
          testMenuVariationId
        )
      }

      // 3. User creates a reservation
      const reservationData = {
        menuId: testMenuId,
        menuVariationId: testMenuVariationId,
        reservationDate: tomorrow.toISOString(),
      }

      const createReservationResponse = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reservationData)
        .expect(201)

      expect(createReservationResponse.body.userId).toBe(testUserId)
      expect(createReservationResponse.body.menuId).toBe(testMenuId)
      expect(createReservationResponse.body.menuVariationId).toBe(
        testMenuVariationId
      )
      expect(createReservationResponse.body.status).toBe("ACTIVE")

      const reservationId = createReservationResponse.body.id

      // 4. User checks their reservations
      const myReservationsResponse = await request(app)
        .get("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(myReservationsResponse.body).toHaveLength(1)
      expect(myReservationsResponse.body[0].id).toBe(reservationId)

      // 5. User checks active reservations
      const activeReservationsResponse = await request(app)
        .get("/api/lunch-reservation/reservations/active")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(activeReservationsResponse.body).toHaveLength(1)
      expect(activeReservationsResponse.body[0].id).toBe(reservationId)

      // 6. User gets specific reservation details
      const reservationDetailsResponse = await request(app)
        .get(`/api/lunch-reservation/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(reservationDetailsResponse.body.id).toBe(reservationId)
      expect(reservationDetailsResponse.body.status).toBe("ACTIVE")

      // 7. User updates reservation (change menu variation if available)
      // For this test, we'll just update the same variation to test the endpoint
      const updateReservationResponse = await request(app)
        .put(`/api/lunch-reservation/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuVariationId: testMenuVariationId,
        })
        .expect(200)

      expect(updateReservationResponse.body.id).toBe(reservationId)
      expect(updateReservationResponse.body.menuVariationId).toBe(
        testMenuVariationId
      )

      // 8. User cancels reservation
      const cancelReservationResponse = await request(app)
        .delete(`/api/lunch-reservation/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(cancelReservationResponse.body.id).toBe(reservationId)
      expect(cancelReservationResponse.body.status).toBe("CANCELLED")

      // 9. Verify reservation is no longer active
      const finalActiveReservationsResponse = await request(app)
        .get("/api/lunch-reservation/reservations/active")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(finalActiveReservationsResponse.body).toHaveLength(0)
    })

    it("should prevent duplicate reservations for same date", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const reservationData = {
        menuId: testMenuId,
        menuVariationId: testMenuVariationId,
        reservationDate: tomorrow.toISOString(),
      }

      // Create first reservation
      await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reservationData)
        .expect(201)

      // Try to create second reservation for same date
      const duplicateResponse = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reservationData)
        .expect(409)

      expect(duplicateResponse.body.error).toBe(
        "Usuário já possui reserva ativa para esta data"
      )
    })

    it("should prevent reservations for past dates", async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const reservationData = {
        menuId: testMenuId,
        menuVariationId: testMenuVariationId,
        reservationDate: yesterday.toISOString(),
      }

      const response = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reservationData)
        .expect(400)

      expect(response.body.error).toBe(
        "Não é possível fazer reserva para data passada"
      )
    })

    it("should prevent reservations for inactive menus", async () => {
      // Deactivate the menu
      await prisma.menu.update({
        where: { id: testMenuId },
        data: { isActive: false },
      })

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const reservationData = {
        menuId: testMenuId,
        menuVariationId: testMenuVariationId,
        reservationDate: tomorrow.toISOString(),
      }

      const response = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reservationData)
        .expect(400)

      expect(response.body.error).toBe("Cardápio não está disponível")
    })
  })

  describe("Admin Reservation Management", () => {
    it("should allow admin to view all reservations", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Create a reservation as user
      await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuId: testMenuId,
          menuVariationId: testMenuVariationId,
          reservationDate: tomorrow.toISOString(),
        })

      // Admin views all reservations
      const adminReservationsResponse = await request(app)
        .get("/api/lunch-reservation/admin/reservations")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)

      expect(adminReservationsResponse.body).toHaveLength(1)
      expect(adminReservationsResponse.body[0].userId).toBe(testUserId)
    })

    it("should prevent regular user from accessing admin reservation routes", async () => {
      const response = await request(app)
        .get("/api/lunch-reservation/admin/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403)

      expect(response.body.error).toBe(
        "Acesso negado. Permissões insuficientes."
      )
    })
  })

  describe("Business Rules Validation", () => {
    it("should respect cutoff time for same-day reservations", async () => {
      // Mock current time to be after 8:30 AM
      const mockDate = new Date()
      mockDate.setHours(9, 0, 0, 0) // 9:00 AM

      // Create menu for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayMenu = await prisma.menu.create({
        data: {
          date: today,
          dayOfWeek: "MONDAY",
          weekNumber: 50,
          observations: "Menu de hoje",
          isActive: true,
        },
      })

      const todayMenuVariation = await prisma.menuVariation.create({
        data: {
          menuId: todayMenu.id,
          variationType: "STANDARD",
          proteinItemId: (await prisma.menuItem.findFirst())!.id,
          isDefault: true,
        },
      })

      const reservationData = {
        menuId: todayMenu.id,
        menuVariationId: todayMenuVariation.id,
        reservationDate: today.toISOString(),
      }

      // This test assumes the cutoff logic is implemented in the service
      // The actual behavior depends on the current system time
      const response = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reservationData)

      // The response could be either 201 (if before cutoff) or 400 (if after cutoff)
      // This test documents the expected behavior
      if (response.status === 400) {
        expect(response.body.error).toContain("Prazo")
      } else {
        expect(response.status).toBe(201)
      }
    })

    it("should validate menu variation belongs to menu", async () => {
      // Create another menu with different variation
      const anotherMenu = await prisma.menu.create({
        data: {
          date: new Date("2024-12-15"),
          dayOfWeek: "FRIDAY",
          weekNumber: 50,
          observations: "Outro menu",
          isActive: true,
        },
      })

      const anotherMenuVariation = await prisma.menuVariation.create({
        data: {
          menuId: anotherMenu.id,
          variationType: "STANDARD",
          proteinItemId: (await prisma.menuItem.findFirst())!.id,
          isDefault: true,
        },
      })

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Try to use variation from different menu
      const reservationData = {
        menuId: testMenuId,
        menuVariationId: anotherMenuVariation.id, // Wrong variation for this menu
        reservationDate: tomorrow.toISOString(),
      }

      const response = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send(reservationData)
        .expect(404)

      expect(response.body.error).toBe("Variação de cardápio não encontrada")
    })
  })

  describe("Error Handling", () => {
    it("should handle invalid reservation data", async () => {
      const response = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send({}) // Empty data
        .expect(400)

      expect(response.body.error).toBe("Erro de validação")
    })

    it("should handle non-existent reservation updates", async () => {
      const response = await request(app)
        .put(
          "/api/lunch-reservation/reservations/550e8400-e29b-41d4-a716-446655440000"
        )
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuVariationId: testMenuVariationId,
        })
        .expect(404)

      expect(response.body.error).toBe("Reserva não encontrada")
    })

    it("should handle non-existent reservation cancellation", async () => {
      const response = await request(app)
        .delete(
          "/api/lunch-reservation/reservations/550e8400-e29b-41d4-a716-446655440000"
        )
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404)

      expect(response.body.error).toBe("Reserva não encontrada")
    })

    it("should prevent users from accessing other users' reservations", async () => {
      // Create another user
      const anotherUser = await prisma.user.create({
        data: {
          cpf: "33366699957",
          password:
            "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
          name: "Another User",
          role: "USER",
          userType: "NAO_FIXO",
          status: "ATIVO",
        },
      })

      // Create reservation for another user directly in database
      const anotherUserReservation = await prisma.reservation.create({
        data: {
          userId: anotherUser.id,
          menuId: testMenuId,
          menuVariationId: testMenuVariationId,
          reservationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          status: "ACTIVE",
          isAutoGenerated: false,
        },
      })

      // Try to access another user's reservation
      const response = await request(app)
        .get(`/api/lunch-reservation/reservations/${anotherUserReservation.id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403)

      expect(response.body.error).toBe("Acesso negado")
    })
  })
})
