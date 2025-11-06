import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../../shared/helpers/app"
import { prisma } from "../../../../src/infrastructure/database/prisma"
import { AuthenticationService } from "../../../../src/app/modules/lunch-reservation/domain/services/AuthenticationService"

describe("Lunch Reservation Authentication E2E Tests", () => {
  // Create a temporary authentication service instance for password hashing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tempAuthService = new AuthenticationService({} as any)

  beforeEach(async () => {
    // Clean up database
    await prisma.reservation.deleteMany()
    await prisma.menuVariation.deleteMany()
    await prisma.menuComposition.deleteMany()
    await prisma.menu.deleteMany()
    await prisma.menuItem.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
  })

  describe("POST /api/lunch-reservation/auth/login", () => {
    it("should authenticate user with valid credentials", async () => {
      // Create a test user directly in database
      await prisma.user.create({
        data: {
          cpf: "11144477735",
          password: tempAuthService.hashPassword("hello"),
          name: "Test User",
          role: "USER",
          userType: "NAO_FIXO",
          status: "ATIVO",
        },
      })

      const loginData = {
        cpf: "11144477735",
        password: "hello",
      }

      const response = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send(loginData)
        .expect(200)

      expect(response.body).toHaveProperty("user")
      expect(response.body).toHaveProperty("token")
      expect(response.body.user.cpf).toBe(loginData.cpf)
      expect(response.body.user.name).toBe("Test User")
      expect(response.body.user.role).toBe("USER")
      expect(response.body.user.userType).toBe("NAO_FIXO")
      expect(response.body.user.status).toBe("ATIVO")
      expect(typeof response.body.token).toBe("string")
    })

    it("should reject login with invalid CPF format", async () => {
      const loginData = {
        cpf: "123456789", // Invalid CPF
        password: "password123",
      }

      const response = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send(loginData)
        .expect(400)

      expect(response.body.error).toBe("Erro de validação")
    })

    it("should reject login with non-existent user", async () => {
      const loginData = {
        cpf: "11144477735",
        password: "password123",
      }

      const response = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send(loginData)
        .expect(401)

      expect(response.body.error).toBe("Credenciais inválidas")
    })

    it("should reject login with incorrect password", async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          cpf: "11144477735",
          password: tempAuthService.hashPassword("hello"),
          name: "Test User",
          role: "USER",
          userType: "NAO_FIXO",
          status: "ATIVO",
        },
      })

      const loginData = {
        cpf: "11144477735",
        password: "wrongpassword",
      }

      const response = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send(loginData)
        .expect(401)

      expect(response.body.error).toBe("Credenciais inválidas")
    })

    it("should reject login for inactive user", async () => {
      // Create an inactive test user
      await prisma.user.create({
        data: {
          cpf: "11144477735",
          password: tempAuthService.hashPassword("hello"),
          name: "Test User",
          role: "USER",
          userType: "NAO_FIXO",
          status: "INATIVO",
        },
      })

      const loginData = {
        cpf: "11144477735",
        password: "hello",
      }

      const response = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send(loginData)
        .expect(401)

      expect(response.body.error).toBe("Usuário inativo")
    })

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send({})
        .expect(400)

      expect(response.body.error).toBe("Erro de validação")
    })
  })

  describe("POST /api/lunch-reservation/auth/refresh", () => {
    it("should refresh valid token", async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          cpf: "11144477735",
          password: tempAuthService.hashPassword("hello"),
          name: "Test User",
          role: "USER",
          userType: "NAO_FIXO",
          status: "ATIVO",
        },
      })

      // Login to get a token
      const loginResponse = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send({
          cpf: "11144477735",
          password: "hello",
        })

      const { token } = loginResponse.body

      // Refresh the token
      const refreshResponse = await request(app)
        .post("/api/lunch-reservation/auth/refresh")
        .send({ refreshToken: token })
        .expect(200)

      expect(refreshResponse.body).toHaveProperty("token")
      expect(typeof refreshResponse.body.token).toBe("string")
      // Note: Token might be the same if generated within the same second due to timestamp precision
    })

    it("should reject invalid token for refresh", async () => {
      const response = await request(app)
        .post("/api/lunch-reservation/auth/refresh")
        .send({ refreshToken: "invalid.token.here" })
        .expect(401)

      expect(response.body.error).toBe("Token inválido")
    })
  })

  describe("Authentication middleware integration", () => {
    it("should protect authenticated routes", async () => {
      const response = await request(app)
        .get("/api/lunch-reservation/users")
        .expect(401)

      expect(response.body.error).toBe("Token de acesso não fornecido")
    })

    it("should allow access with valid token", async () => {
      // Create an admin user
      await prisma.user.create({
        data: {
          cpf: "11144477735",
          password: tempAuthService.hashPassword("hello"),
          name: "Admin User",
          role: "ADMIN",
          userType: "NAO_FIXO",
          status: "ATIVO",
        },
      })

      // Login to get a token
      const loginResponse = await request(app)
        .post("/api/lunch-reservation/auth/login")
        .send({
          cpf: "11144477735",
          password: "hello",
        })

      const { token } = loginResponse.body

      // Access protected route with token
      const response = await request(app)
        .get("/api/lunch-reservation/users")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it("should reject expired or invalid tokens", async () => {
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"

      const response = await request(app)
        .get("/api/lunch-reservation/users")
        .set("Authorization", `Bearer ${invalidToken}`)
        .expect(401)

      expect(response.body.error).toBe("Token inválido")
    })
  })

  describe("Role-based access control", () => {
    let userToken: string
    let adminToken: string

    beforeEach(async () => {
      // Create regular user
      await prisma.user.create({
        data: {
          cpf: "11144477735",
          password: tempAuthService.hashPassword("hello"),
          name: "Regular User",
          role: "USER",
          userType: "NAO_FIXO",
          status: "ATIVO",
        },
      })

      // Create admin user
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

      // Get tokens
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
    })

    it("should allow admin access to admin-only routes", async () => {
      const response = await request(app)
        .get("/api/lunch-reservation/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it("should deny regular user access to admin-only routes", async () => {
      const response = await request(app)
        .get("/api/lunch-reservation/users")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403)

      expect(response.body.error).toBe(
        "Acesso negado. Permissões insuficientes."
      )
    })

    it("should allow regular user access to user routes", async () => {
      const response = await request(app)
        .get("/api/lunch-reservation/menus")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it("should allow admin access to user routes", async () => {
      const response = await request(app)
        .get("/api/lunch-reservation/menus")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })
  })
})
