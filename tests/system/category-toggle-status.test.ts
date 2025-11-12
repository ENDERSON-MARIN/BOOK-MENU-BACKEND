import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import { app } from "@/infrastructure/http/server"

describe("Category Toggle Status", () => {
  let authToken: string
  let categoryId: string

  beforeAll(async () => {
    // Login como admin
    const loginResponse = await request(app).post("/api/auth/login").send({
      cpf: "00000000000",
      password: "password",
    })

    authToken = loginResponse.body.token

    // Criar uma categoria para testar
    const categoryResponse = await request(app)
      .post("/api/lunch-reservation/categories")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Categoria Teste Toggle",
        description: "Categoria para testar toggle de status",
        displayOrder: 99,
      })

    categoryId = categoryResponse.body.id
  })

  afterAll(async () => {
    // Limpar: deletar a categoria criada
    if (categoryId) {
      await request(app)
        .delete(`/api/lunch-reservation/categories/${categoryId}`)
        .set("Authorization", `Bearer ${authToken}`)
    }
  })

  it("deve alternar o status da categoria de ativa para inativa", async () => {
    const response = await request(app)
      .patch(`/api/lunch-reservation/categories/${categoryId}/toggle-active`)
      .set("Authorization", `Bearer ${authToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("id", categoryId)
    expect(response.body).toHaveProperty("isActive", false)
  })

  it("deve alternar o status da categoria de inativa para ativa", async () => {
    const response = await request(app)
      .patch(`/api/lunch-reservation/categories/${categoryId}/toggle-active`)
      .set("Authorization", `Bearer ${authToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("id", categoryId)
    expect(response.body).toHaveProperty("isActive", true)
  })

  it("deve retornar 404 para categoria inexistente", async () => {
    const fakeId = "550e8400-e29b-41d4-a716-446655440999"
    const response = await request(app)
      .patch(`/api/lunch-reservation/categories/${fakeId}/toggle-active`)
      .set("Authorization", `Bearer ${authToken}`)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty("error", "Categoria não encontrada")
  })

  it("deve retornar 401 sem autenticação", async () => {
    const response = await request(app).patch(
      `/api/lunch-reservation/categories/${categoryId}/toggle-active`
    )

    expect(response.status).toBe(401)
  })

  it("deve retornar 400 para ID inválido", async () => {
    const response = await request(app)
      .patch("/api/lunch-reservation/categories/invalid-id/toggle-active")
      .set("Authorization", `Bearer ${authToken}`)

    expect(response.status).toBe(400)
  })
})
