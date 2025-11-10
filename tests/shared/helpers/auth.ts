import request from "supertest"
import { app } from "./app"
import { prisma } from "../../../src/infrastructure/database/prisma"
import { makeAuthModule } from "../../../src/app/modules/auth"

const { authService } = makeAuthModule()

export interface TestUser {
  cpf: string
  password: string
  name: string
  role: "ADMIN" | "USER"
}

export async function createTestUser(userData: TestUser) {
  const hashedPassword = await authService.hashPassword(userData.password)

  return await prisma.user.create({
    data: {
      cpf: userData.cpf,
      password: hashedPassword,
      name: userData.name,
      role: userData.role,
      userType: "NAO_FIXO",
      status: "ATIVO",
    },
  })
}

export async function loginAndGetToken(
  cpf: string,
  password: string
): Promise<string> {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ cpf, password })
    .expect(200)

  return response.body.token
}

export async function createTestUserAndGetToken(
  userData: TestUser
): Promise<string> {
  await createTestUser(userData)
  return await loginAndGetToken(userData.cpf, userData.password)
}
