import { describe, it, expect, beforeEach, afterEach } from "vitest"
import request from "supertest"
import { app } from "../../../shared/helpers/app"
import { prisma } from "@/infrastructure/database/prisma"
import bcrypt from "bcryptjs"
import { UserRole, UserStatus, UserType } from "@prisma/client"

describe("Authentication Integration Tests", () => {
  // Test user data
  const testUsers = {
    activeUser: {
      cpf: "12345678901",
      password: "password123",
      name: "Active User",
      role: UserRole.USER,
      userType: UserType.NAO_FIXO,
      status: UserStatus.ATIVO,
    },
    inactiveUser: {
      cpf: "98765432109",
      password: "password123",
      name: "Inactive User",
      role: UserRole.USER,
      userType: UserType.NAO_FIXO,
      status: UserStatus.INATIVO,
    },
    adminUser: {
      cpf: "11111111111",
      password: "admin123",
      name: "Admin User",
      role: UserRole.ADMIN,
      userType: UserType.FIXO,
      status: UserStatus.ATIVO,
    },
  }

  beforeEach(async () => {
    // Clean users table
    await prisma.user.deleteMany()

    // Create test users with hashed passwords
    const hashedPassword = await bcrypt.hash(testUsers.activeUser.password, 10)
    const hashedAdminPassword = await bcrypt.hash(
      testUsers.adminUser.password,
      10
    )

    await prisma.user.create({
      data: {
        ...testUsers.activeUser,
        password: hashedPassword,
      },
    })

    await prisma.user.create({
      data: {
        ...testUsers.inactiveUser,
        password: hashedPassword,
      },
    })

    await prisma.user.create({
      data: {
        ...testUsers.adminUser,
        password: hashedAdminPassword,
      },
    })
  })

  afterEach(async () => {
    // Clean up users after each test
    await prisma.user.deleteMany()
  })

  describe("POST /api/auth/login", () => {
    describe("13.1 Test POST /api/auth/login with valid credentials", () => {
      it("should return 200 with token and user data for valid credentials", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            cpf: testUsers.activeUser.cpf,
            password: testUsers.activeUser.password,
          })
          .expect(200)

        // Verify response structure
        expect(response.body).toHaveProperty("token")
        expect(response.body).toHaveProperty("user")

        // Verify token is a string
        expect(typeof response.body.token).toBe("string")
        expect(response.body.token.length).toBeGreaterThan(0)

        // Verify user data
        expect(response.body.user).toMatchObject({
          cpf: testUsers.activeUser.cpf,
          name: testUsers.activeUser.name,
          role: testUsers.activeUser.role,
        })

        // Verify user has an id
        expect(response.body.user).toHaveProperty("id")
        expect(typeof response.body.user.id).toBe("string")

        // Verify password is not included in response
        expect(response.body.user).not.toHaveProperty("password")
      })
    })

    describe("13.2 Test POST /api/auth/login with invalid CPF", () => {
      it("should return 401 with 'Credenciais inválidas' for non-existent CPF", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            cpf: "99999999999",
            password: "anypassword",
          })
          .expect(401)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Credenciais inválidas")
      })
    })

    describe("13.3 Test POST /api/auth/login with incorrect password", () => {
      it("should return 401 with 'Credenciais inválidas' for wrong password", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            cpf: testUsers.activeUser.cpf,
            password: "wrongpassword",
          })
          .expect(401)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Credenciais inválidas")
      })
    })

    describe("13.4 Test POST /api/auth/login with inactive user", () => {
      it("should return 403 with 'Usuário inativo' for inactive user", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            cpf: testUsers.inactiveUser.cpf,
            password: testUsers.inactiveUser.password,
          })
          .expect(403)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Usuário inativo")
      })
    })

    describe("13.5 Test POST /api/auth/login with missing fields", () => {
      it("should return 400 with validation error details when CPF is missing", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            password: "password123",
          })
          .expect(400)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Validation error")
        expect(response.body).toHaveProperty("details")
        expect(Array.isArray(response.body.details)).toBe(true)
        expect(response.body.details.length).toBeGreaterThan(0)
      })

      it("should return 400 with validation error details when password is missing", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            cpf: "12345678901",
          })
          .expect(400)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Validation error")
        expect(response.body).toHaveProperty("details")
        expect(Array.isArray(response.body.details)).toBe(true)
        expect(response.body.details.length).toBeGreaterThan(0)
      })

      it("should return 400 with validation error details when both fields are missing", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({})
          .expect(400)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Validation error")
        expect(response.body).toHaveProperty("details")
        expect(Array.isArray(response.body.details)).toBe(true)
        expect(response.body.details.length).toBeGreaterThan(0)
      })
    })

    describe("13.6 Test POST /api/auth/login with invalid CPF format", () => {
      it("should return 400 with CPF validation error for CPF with less than 11 digits", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            cpf: "123456789",
            password: "password123",
          })
          .expect(400)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Validation error")
        expect(response.body).toHaveProperty("details")
        expect(Array.isArray(response.body.details)).toBe(true)

        // Check that CPF validation error is present
        const cpfError = response.body.details.find(
          (detail: any) => detail.path && detail.path.includes("cpf")
        )
        expect(cpfError).toBeDefined()
      })

      it("should return 400 with CPF validation error for CPF with more than 11 digits", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            cpf: "123456789012",
            password: "password123",
          })
          .expect(400)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Validation error")
        expect(response.body).toHaveProperty("details")

        const cpfError = response.body.details.find(
          (detail: unknown) => detail.path && detail.path.includes("cpf")
        )
        expect(cpfError).toBeDefined()
      })

      it("should return 400 with CPF validation error for CPF with non-numeric characters", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            cpf: "123.456.789-01",
            password: "password123",
          })
          .expect(400)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Validation error")
        expect(response.body).toHaveProperty("details")

        const cpfError = response.body.details.find(
          (detail: unknown) => detail.path && detail.path.includes("cpf")
        )
        expect(cpfError).toBeDefined()
      })
    })

    describe("13.7 Test POST /api/auth/login with short password", () => {
      it("should return 400 with password validation error for password less than 6 characters", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            cpf: "12345678901",
            password: "12345",
          })
          .expect(400)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Validation error")
        expect(response.body).toHaveProperty("details")
        expect(Array.isArray(response.body.details)).toBe(true)

        // Check that password validation error is present
        const passwordError = response.body.details.find(
          (detail: unknown) => detail.path && detail.path.includes("password")
        )
        expect(passwordError).toBeDefined()
      })
    })
  })

  describe("POST /api/auth/logout", () => {
    describe("13.8 Test POST /api/auth/logout", () => {
      it("should return 200 with success message", async () => {
        const response = await request(app).post("/api/auth/logout").expect(200)

        expect(response.body).toHaveProperty("message")
        expect(response.body.message).toBe("Logout realizado com sucesso")
      })
    })
  })

  describe("Authentication Middleware Tests", () => {
    let validToken: string

    beforeEach(async () => {
      // Get a valid token for testing
      const loginResponse = await request(app).post("/api/auth/login").send({
        cpf: testUsers.activeUser.cpf,
        password: testUsers.activeUser.password,
      })

      validToken = loginResponse.body.token
    })

    describe("14.1 Test protected endpoint without token", () => {
      it("should return 401 with 'Token não fornecido' when no token is provided", async () => {
        const response = await request(app).get("/api/devices").expect(401)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Token não fornecido")
      })

      it("should return 401 with 'Token não fornecido' when Authorization header is missing Bearer prefix", async () => {
        const response = await request(app)
          .get("/api/devices")
          .set("Authorization", "InvalidFormat token123")
          .expect(401)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Token não fornecido")
      })
    })

    describe("14.2 Test protected endpoint with invalid token", () => {
      it("should return 401 with 'Token inválido' for malformed token", async () => {
        const response = await request(app)
          .get("/api/devices")
          .set("Authorization", "Bearer invalid.token.here")
          .expect(401)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Token inválido")
      })

      it("should return 401 with 'Token inválido' for token with invalid signature", async () => {
        // Create a token with wrong secret
        const fakeToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJjcGYiOiIxMjM0NTY3ODkwMSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNjk5NjMyMDAwfQ.invalid_signature"

        const response = await request(app)
          .get("/api/devices")
          .set("Authorization", `Bearer ${fakeToken}`)
          .expect(401)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Token inválido")
      })
    })

    describe("14.3 Test protected endpoint with expired token", () => {
      it("should return 401 with 'Token expirado' for expired token", async () => {
        // Create an expired token by using a very short expiration time
        const jwt = await import("jsonwebtoken")
        const expiredToken = jwt.sign(
          {
            userId: "test-id",
            cpf: testUsers.activeUser.cpf,
            role: testUsers.activeUser.role,
          },
          process.env.JWT_SECRET || "test-secret",
          { expiresIn: "0s" } // Expires immediately
        )

        // Wait a moment to ensure token is expired
        await new Promise((resolve) => setTimeout(resolve, 100))

        const response = await request(app)
          .get("/api/devices")
          .set("Authorization", `Bearer ${expiredToken}`)
          .expect(401)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Token expirado")
      })
    })

    describe("14.4 Test protected endpoint with valid token", () => {
      it("should allow request to proceed with valid token and attach user data to req.user", async () => {
        const response = await request(app)
          .get("/api/devices")
          .set("Authorization", `Bearer ${validToken}`)
          .expect(200)

        // If the request succeeds, it means the middleware allowed it through
        // The actual response will depend on the device endpoint implementation
        // We're just verifying that authentication passed
        expect(response.status).toBe(200)
      })
    })
  })

  describe("Authorization Middleware Tests", () => {
    let userToken: string
    let adminToken: string

    beforeEach(async () => {
      // Get token for regular USER
      const userLoginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          cpf: testUsers.activeUser.cpf,
          password: testUsers.activeUser.password,
        })
      userToken = userLoginResponse.body.token

      // Get token for ADMIN
      const adminLoginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          cpf: testUsers.adminUser.cpf,
          password: testUsers.adminUser.password,
        })
      adminToken = adminLoginResponse.body.token
    })

    describe("15.1 Test admin-only endpoint with USER role", () => {
      it("should return 403 with 'Acesso negado' when USER tries to access admin-only endpoint", async () => {
        const response = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            name: "Test Device",
            location: "Test Location",
          })
          .expect(403)

        expect(response.body).toHaveProperty("error")
        expect(response.body.error).toBe("Acesso negado")
      })
    })

    describe("15.2 Test admin-only endpoint with ADMIN role", () => {
      it("should allow request to proceed when ADMIN accesses admin-only endpoint", async () => {
        const response = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            name: "Test Device",
            location: "Test Location",
          })

        // Request should proceed successfully (not 403)
        // The actual status code depends on the device controller implementation
        // We're verifying that authorization passed (not 403)
        expect(response.status).not.toBe(403)
      })
    })
  })
})
