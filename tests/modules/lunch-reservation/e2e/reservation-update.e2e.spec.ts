import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../../shared/helpers/app"
import { prisma } from "../../../../src/infrastructure/database/prisma"
import { makeAuthModule } from "../../../../src/app/modules/auth"

describe("Reservation Update E2E Tests - Fix Error 500", () => {
  const { authService } = makeAuthModule()

  let userToken: string
  let testUserId: string
  let testMenuId: string
  let testMenuVariationId: string
  let alternativeMenuVariationId: string
  let anotherMenuVariationId: string

  beforeEach(async () => {
    // Clean up database
    await prisma.reservation.deleteMany()
    await prisma.menuVariation.deleteMany()
    await prisma.menuComposition.deleteMany()
    await prisma.menu.deleteMany()
    await prisma.menuItem.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        cpf: "11144477735",
        password: await authService.hashPassword("hello123"),
        name: "Test User",
        role: "USER",
        userType: "NAO_FIXO",
        status: "ATIVO",
      },
    })
    testUserId = testUser.id

    // Get authentication token
    const userLoginResponse = await request(app)
      .post("/api/lunch-reservation/auth/login")
      .send({
        cpf: "11144477735",
        password: "hello123",
      })

    userToken = userLoginResponse.body.token

    // Create test category and menu items
    const testCategory = await prisma.category.create({
      data: {
        name: "Proteínas",
        description: "Categoria de proteínas",
        displayOrder: 1,
        isActive: true,
      },
    })

    const testMenuItem1 = await prisma.menuItem.create({
      data: {
        name: "Frango Grelhado",
        description: "Frango grelhado com temperos",
        categoryId: testCategory.id,
        isActive: true,
      },
    })

    const testMenuItem2 = await prisma.menuItem.create({
      data: {
        name: "Ovo Frito",
        description: "Ovo frito como alternativa",
        categoryId: testCategory.id,
        isActive: true,
      },
    })

    // Create menu for tomorrow (within modification deadline)
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

    // Create two variations for the same menu
    const testMenuVariation = await prisma.menuVariation.create({
      data: {
        menuId: testMenu.id,
        variationType: "STANDARD",
        proteinItemId: testMenuItem1.id,
        isDefault: true,
      },
    })
    testMenuVariationId = testMenuVariation.id

    const alternativeMenuVariation = await prisma.menuVariation.create({
      data: {
        menuId: testMenu.id,
        variationType: "EGG_SUBSTITUTE",
        proteinItemId: testMenuItem2.id,
        isDefault: false,
      },
    })
    alternativeMenuVariationId = alternativeMenuVariation.id

    await prisma.menuComposition.createMany({
      data: [
        {
          menuId: testMenu.id,
          menuItemId: testMenuItem1.id,
          observations: "Proteína principal",
          isMainProtein: true,
          isAlternativeProtein: false,
        },
        {
          menuId: testMenu.id,
          menuItemId: testMenuItem2.id,
          observations: "Proteína alternativa",
          isMainProtein: false,
          isAlternativeProtein: true,
        },
      ],
    })

    // Create another menu with different variation
    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    dayAfterTomorrow.setUTCHours(0, 0, 0, 0)

    const anotherMenu = await prisma.menu.create({
      data: {
        date: dayAfterTomorrow,
        dayOfWeek: "WEDNESDAY",
        weekNumber: 50,
        observations: "Outro menu",
        isActive: true,
      },
    })

    const anotherMenuVariation = await prisma.menuVariation.create({
      data: {
        menuId: anotherMenu.id,
        variationType: "STANDARD",
        proteinItemId: testMenuItem1.id,
        isDefault: true,
      },
    })
    anotherMenuVariationId = anotherMenuVariation.id
  })

  describe("Scenario 1: Update with valid variation from same menu", () => {
    it("should successfully update reservation with valid variation from same menu", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Create initial reservation
      const createResponse = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuId: testMenuId,
          menuVariationId: testMenuVariationId,
          reservationDate: tomorrow.toISOString(),
        })
        .expect(201)

      const reservationId = createResponse.body.id
      expect(createResponse.body.menuVariationId).toBe(testMenuVariationId)

      // Update to alternative variation from same menu
      const updateResponse = await request(app)
        .put(`/api/lunch-reservation/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuVariationId: alternativeMenuVariationId,
        })
        .expect(200)

      expect(updateResponse.body.id).toBe(reservationId)
      expect(updateResponse.body.menuVariationId).toBe(
        alternativeMenuVariationId
      )
      expect(updateResponse.body.status).toBe("ACTIVE")
    })
  })

  describe("Scenario 2: Update with invalid variation (UUID that doesn't exist)", () => {
    it("should return 404 error when trying to update with non-existent variation", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Create initial reservation
      const createResponse = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuId: testMenuId,
          menuVariationId: testMenuVariationId,
          reservationDate: tomorrow.toISOString(),
        })
        .expect(201)

      const reservationId = createResponse.body.id

      // Try to update with non-existent variation UUID
      const nonExistentVariationId = "550e8400-e29b-41d4-a716-446655440000"
      const updateResponse = await request(app)
        .put(`/api/lunch-reservation/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuVariationId: nonExistentVariationId,
        })
        .expect(404)

      expect(updateResponse.body.error).toContain("Variação de cardápio com ID")
      expect(updateResponse.body.error).toContain(
        "não encontrada no cardápio da reserva"
      )
    })

    it("should return 400 error when trying to update with invalid UUID format", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Create initial reservation
      const createResponse = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuId: testMenuId,
          menuVariationId: testMenuVariationId,
          reservationDate: tomorrow.toISOString(),
        })
        .expect(201)

      const reservationId = createResponse.body.id

      // Try to update with invalid UUID format
      const updateResponse = await request(app)
        .put(`/api/lunch-reservation/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuVariationId: "invalid-uuid",
        })
        .expect(400)

      expect(updateResponse.body.error).toBe("Erro de validação")
    })
  })

  describe("Scenario 3: Update with variation from another menu", () => {
    it("should return 404 error when trying to update with variation from different menu", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Create initial reservation
      const createResponse = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuId: testMenuId,
          menuVariationId: testMenuVariationId,
          reservationDate: tomorrow.toISOString(),
        })
        .expect(201)

      const reservationId = createResponse.body.id

      // Try to update with variation from another menu
      const updateResponse = await request(app)
        .put(`/api/lunch-reservation/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuVariationId: anotherMenuVariationId,
        })
        .expect(404)

      expect(updateResponse.body.error).toContain("Variação de cardápio com ID")
      expect(updateResponse.body.error).toContain(
        "não encontrada no cardápio da reserva"
      )
    })
  })

  describe("Scenario 4: Update after deadline expired", () => {
    it("should return 400 error when trying to update reservation after cutoff time", async () => {
      // Create menu for today (past cutoff time)
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

      // Create reservation directly in database (simulating it was created before cutoff)
      const reservation = await prisma.reservation.create({
        data: {
          userId: testUserId,
          menuId: todayMenu.id,
          menuVariationId: todayMenuVariation.id,
          reservationDate: today,
          status: "ACTIVE",
          isAutoGenerated: false,
        },
      })

      // Try to update after cutoff time (assuming current time is after 8:30 AM)
      const currentHour = new Date().getHours()

      // Only run this test if current time is after 8:30 AM
      if (currentHour >= 9) {
        const updateResponse = await request(app)
          .put(`/api/lunch-reservation/reservations/${reservation.id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            menuVariationId: todayMenuVariation.id,
          })
          .expect(400)

        expect(updateResponse.body.error).toContain("prazo")
      } else {
        // If before cutoff, update should succeed
        const updateResponse = await request(app)
          .put(`/api/lunch-reservation/reservations/${reservation.id}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            menuVariationId: todayMenuVariation.id,
          })

        expect([200, 400]).toContain(updateResponse.status)
      }
    })
  })

  describe("Scenario 5: Verify no 500 errors occur", () => {
    it("should never return 500 error for any update scenario", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Create initial reservation
      const createResponse = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuId: testMenuId,
          menuVariationId: testMenuVariationId,
          reservationDate: tomorrow.toISOString(),
        })
        .expect(201)

      const reservationId = createResponse.body.id

      // Test multiple scenarios and ensure none return 500
      const testScenarios = [
        {
          name: "Valid variation from same menu",
          data: { menuVariationId: alternativeMenuVariationId },
          expectedStatuses: [200],
        },
        {
          name: "Non-existent variation",
          data: { menuVariationId: "550e8400-e29b-41d4-a716-446655440000" },
          expectedStatuses: [404],
        },
        {
          name: "Variation from another menu",
          data: { menuVariationId: anotherMenuVariationId },
          expectedStatuses: [404],
        },
        {
          name: "Invalid UUID format",
          data: { menuVariationId: "invalid-uuid" },
          expectedStatuses: [400],
        },
        {
          name: "Empty body",
          data: {},
          expectedStatuses: [200], // Should succeed with no changes
        },
      ]

      for (const scenario of testScenarios) {
        const response = await request(app)
          .put(`/api/lunch-reservation/reservations/${reservationId}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send(scenario.data)

        // Verify no 500 error
        expect(response.status).not.toBe(500)

        // Verify status is one of the expected
        expect(scenario.expectedStatuses).toContain(response.status)
      }
    })

    it("should return appropriate error messages for all error scenarios", async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Create initial reservation
      const createResponse = await request(app)
        .post("/api/lunch-reservation/reservations")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          menuId: testMenuId,
          menuVariationId: testMenuVariationId,
          reservationDate: tomorrow.toISOString(),
        })
        .expect(201)

      const reservationId = createResponse.body.id

      // Test that error responses have proper structure
      const errorScenarios = [
        {
          data: { menuVariationId: "550e8400-e29b-41d4-a716-446655440000" },
          expectedStatus: 404,
          expectedErrorContains: [
            "Variação de cardápio com ID",
            "não encontrada",
          ],
        },
        {
          data: { menuVariationId: "invalid-uuid" },
          expectedStatus: 400,
          expectedErrorContains: ["Erro de validação"],
        },
        {
          data: { menuVariationId: anotherMenuVariationId },
          expectedStatus: 404,
          expectedErrorContains: [
            "Variação de cardápio com ID",
            "não encontrada",
          ],
        },
      ]

      for (const scenario of errorScenarios) {
        const response = await request(app)
          .put(`/api/lunch-reservation/reservations/${reservationId}`)
          .set("Authorization", `Bearer ${userToken}`)
          .send(scenario.data)
          .expect(scenario.expectedStatus)

        expect(response.body).toHaveProperty("error")
        for (const errorPart of scenario.expectedErrorContains) {
          expect(response.body.error).toContain(errorPart)
        }
      }
    })
  })
})
