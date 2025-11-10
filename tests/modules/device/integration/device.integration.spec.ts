import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { app } from "../../../shared/helpers/app"
import { prisma } from "../../../../src/infrastructure/database/prisma"
import { createTestUserAndGetToken } from "../../../shared/helpers/auth"

describe("Device Integration Tests", () => {
  let adminToken: string
  let userToken: string

  beforeEach(async () => {
    // Clean up
    await prisma.device.deleteMany()
    await prisma.user.deleteMany()

    // Create test users and get tokens
    adminToken = await createTestUserAndGetToken({
      cpf: "11144477735",
      password: "admin123",
      name: "Admin User",
      role: "ADMIN",
    })

    userToken = await createTestUserAndGetToken({
      cpf: "22255588846",
      password: "user123",
      name: "Regular User",
      role: "USER",
    })
  })

  describe("POST /api/devices", () => {
    it("should create a new device with valid data", async () => {
      const deviceData = {
        name: "Test Device",
        mac: "AA:BB:CC:DD:EE:FF",
      }

      const response = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(deviceData)
        .expect(201)

      expect(response.body).toHaveProperty("id")
      expect(response.body.name).toBe("Test Device")
      expect(response.body.mac).toBe("AA:BB:CC:DD:EE:FF")
      expect(response.body.status).toBe("ATIVO")
      expect(response.body).toHaveProperty("createdAt")
    })

    it("should return 400 for missing name field", async () => {
      const deviceData = {
        mac: "AA:BB:CC:DD:EE:FF",
      }

      const response = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(deviceData)
        .expect(400)

      expect(response.body.error).toBe("Validation error")
      expect(response.body.details).toBeDefined()
    })

    it("should return 400 for missing mac field", async () => {
      const deviceData = {
        name: "Test Device",
      }

      const response = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(deviceData)
        .expect(400)

      expect(response.body.error).toBe("Validation error")
      expect(response.body.details).toBeDefined()
    })

    it("should return 400 for empty name field", async () => {
      const deviceData = {
        name: "",
        mac: "AA:BB:CC:DD:EE:FF",
      }

      const response = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(deviceData)
        .expect(400)

      expect(response.body.error).toBe("Validation error")
    })

    it("should return 400 for empty mac field", async () => {
      const deviceData = {
        name: "Test Device",
        mac: "",
      }

      const response = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(deviceData)
        .expect(400)

      expect(response.body.error).toBe("Validation error")
    })

    it("should return 409 for duplicate MAC address", async () => {
      const deviceData = {
        name: "Device 1",
        mac: "AA:BB:CC:DD:EE:FF",
      }

      // Create first device
      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(deviceData)
        .expect(201)

      // Try to create second device with same MAC
      const duplicateDevice = {
        name: "Device 2",
        mac: "AA:BB:CC:DD:EE:FF",
      }

      const response = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(duplicateDevice)
        .expect(409)

      expect(response.body.error).toContain("MAC address already exists")
    })

    it("should handle special characters in device name", async () => {
      const deviceData = {
        name: "Device & Router - WiFi 5GHz",
        mac: "AA:BB:CC:DD:EE:FF",
      }

      const response = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(deviceData)
        .expect(201)

      expect(response.body.name).toBe("Device & Router - WiFi 5GHz")
    })
  })

  describe("GET /api/devices", () => {
    it("should return all devices", async () => {
      // Create test devices
      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Device 1",
          mac: "AA:BB:CC:DD:EE:01",
        })

      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Device 2",
          mac: "AA:BB:CC:DD:EE:02",
        })

      const response = await request(app)
        .get("/api/devices")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0]).toHaveProperty("name")
      expect(response.body[0]).toHaveProperty("mac")
      expect(response.body[0]).toHaveProperty("status")
      expect(response.body[0]).toHaveProperty("createdAt")
    })

    it("should return empty array when no devices exist", async () => {
      const response = await request(app)
        .get("/api/devices")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(response.body).toEqual([])
    })

    it("should return devices ordered by creation date (newest first)", async () => {
      const device1 = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Device 1",
          mac: "AA:BB:CC:DD:EE:01",
        })

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10))

      const device2 = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Device 2",
          mac: "AA:BB:CC:DD:EE:02",
        })

      const response = await request(app)
        .get("/api/devices")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(response.body[0].id).toBe(device2.body.id)
      expect(response.body[1].id).toBe(device1.body.id)
    })

    it("should include all required fields in response", async () => {
      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Device",
          mac: "AA:BB:CC:DD:EE:FF",
        })

      const response = await request(app)
        .get("/api/devices")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0]).toHaveProperty("name")
      expect(response.body[0]).toHaveProperty("mac")
      expect(response.body[0]).toHaveProperty("status")
      expect(response.body[0]).toHaveProperty("createdAt")
    })
  })

  describe("PATCH /api/devices/:id/status", () => {
    it("should toggle device status from ATIVO to INATIVO", async () => {
      const created = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Device",
          mac: "AA:BB:CC:DD:EE:FF",
        })

      expect(created.body.status).toBe("ATIVO")

      const response = await request(app)
        .patch(`/api/devices/${created.body.id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(response.body.status).toBe("INATIVO")
      expect(response.body.id).toBe(created.body.id)
      expect(response.body.name).toBe("Test Device")
    })

    it("should toggle device status from INATIVO to ATIVO", async () => {
      const created = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Device",
          mac: "AA:BB:CC:DD:EE:FF",
        })

      // First toggle to INATIVO
      await request(app)
        .patch(`/api/devices/${created.body.id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      // Then toggle back to ATIVO
      const response = await request(app)
        .patch(`/api/devices/${created.body.id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(response.body.status).toBe("ATIVO")
    })

    it("should return 404 for non-existent device", async () => {
      const response = await request(app)
        .patch("/api/devices/550e8400-e29b-41d4-a716-446655440000/status")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404)

      expect(response.body.error).toBe("Device not found")
    })

    it("should return 400 for invalid UUID format", async () => {
      const response = await request(app)
        .patch("/api/devices/invalid-uuid/status")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(400)

      expect(response.body.error).toBe("Validation error")
    })

    it("should return updated device data in response", async () => {
      const created = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Device",
          mac: "AA:BB:CC:DD:EE:FF",
        })

      const response = await request(app)
        .patch(`/api/devices/${created.body.id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("id")
      expect(response.body).toHaveProperty("name")
      expect(response.body).toHaveProperty("mac")
      expect(response.body).toHaveProperty("status")
      expect(response.body).toHaveProperty("createdAt")
    })
  })

  describe("Edge Cases and Error Handling", () => {
    it("should handle concurrent device creation requests", async () => {
      const requests = Array.from({ length: 3 }, (_, i) =>
        request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            name: `Device ${i}`,
            mac: `AA:BB:CC:DD:EE:0${i}`,
          })
      )

      const responses = await Promise.all(requests)

      responses.forEach((response) => {
        expect(response.status).toBe(201)
      })

      const allDevices = await request(app)
        .get("/api/devices")
        .set("Authorization", `Bearer ${userToken}`)
      expect(allDevices.body).toHaveLength(3)
    })

    it("should handle concurrent status toggle requests", async () => {
      const created = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Device",
          mac: "AA:BB:CC:DD:EE:FF",
        })

      const requests = Array.from({ length: 3 }, () =>
        request(app)
          .patch(`/api/devices/${created.body.id}/status`)
          .set("Authorization", `Bearer ${userToken}`)
      )

      const responses = await Promise.all(requests)

      responses.forEach((response) => {
        expect(response.status).toBe(200)
      })
    })

    it("should preserve device data during status toggle", async () => {
      const created = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Device",
          mac: "AA:BB:CC:DD:EE:FF",
        })

      const response = await request(app)
        .patch(`/api/devices/${created.body.id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)

      expect(response.body.name).toBe(created.body.name)
      expect(response.body.mac).toBe(created.body.mac)
      expect(response.body.id).toBe(created.body.id)
      expect(response.body.createdAt).toBe(created.body.createdAt)
    })
  })
})
