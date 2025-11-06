import { beforeAll, afterAll } from "vitest"
import { prisma } from "@/infrastructure/database/prisma"

beforeAll(async () => {
  console.log("🔧 Setting up integration test environment...")

  await prisma.$connect()

  // Clean database before starting tests
  await prisma.device.deleteMany()

  console.log("✅ Test database connected")
})

afterAll(async () => {
  console.log("🧹 Cleaning up integration test environment...")

  // Clean database after all tests
  await prisma.device.deleteMany()

  await prisma.$disconnect()

  console.log("✅ Test database disconnected")
})
