import { describe, it, expect, beforeEach, afterEach } from "vitest"
import request from "supertest"
import { createServer } from "http"
import { io as Client, Socket as ClientSocket } from "socket.io-client"
import express from "express"
import cors from "cors"
import { Router } from "express"
import { errorHandler } from "../../../src/infrastructure/http/middlewares/errorHandler"
import { WebSocketService } from "../../../src/infrastructure/websocket/WebSocketService"
import { makeDeviceModule } from "../../../src/app/modules/device/factories/makeDeviceModule"
import { prisma } from "../../../src/infrastructure/database/prisma"

interface DeviceEventData {
  id: string
  name: string
  mac: string
  status: string
  createdAt: string
  updatedAt: string
}

describe("WebSocket Integration Tests", () => {
  let app: express.Application
  let httpServer: ReturnType<typeof createServer>
  let webSocketService: WebSocketService
  let clientSocket: ClientSocket
  let port: number

  beforeEach(async () => {
    // Clean database
    await prisma.device.deleteMany()

    // Create Express app
    app = express()
    app.use(cors())
    app.use(express.json())

    // Create HTTP server
    httpServer = createServer(app)

    // Initialize WebSocket service
    webSocketService = new WebSocketService(httpServer)

    // Create device module with WebSocket service
    const { deviceController } = makeDeviceModule({
      websocketService: webSocketService,
    })

    // Setup routes manually with the configured device controller
    const deviceRouter = Router()
    deviceRouter.post("/devices", (req, res) =>
      deviceController.create(req, res)
    )
    deviceRouter.get("/devices", (req, res) =>
      deviceController.getAll(req, res)
    )
    deviceRouter.patch("/devices/:id/status", (req, res) =>
      deviceController.toggleStatus(req, res)
    )

    app.use("/api", deviceRouter)
    app.use(errorHandler)

    // Start server on random port
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const address = httpServer.address()
        port =
          typeof address === "string" ? parseInt(address) : address?.port || 0
        resolve()
      })
    })

    // Create client socket connection
    clientSocket = Client(`http://localhost:${port}`)
    await new Promise<void>((resolve) => {
      clientSocket.on("connect", () => resolve())
    })
  })

  afterEach(async () => {
    // Clean up client socket
    if (clientSocket.connected) {
      clientSocket.disconnect()
    }

    // Clean up server
    if (httpServer) {
      await new Promise<void>((resolve) => {
        httpServer.close(() => resolve())
      })
    }

    // Clean database
    await prisma.device.deleteMany()
  })

  describe("device:created event emission", () => {
    it("should emit device:created event when a new device is created", async () => {
      const deviceData = {
        name: "Test Device",
        mac: "AA:BB:CC:DD:EE:FF",
      }

      // Listen for the WebSocket event with timeout
      const eventPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("WebSocket event not received within timeout"))
        }, 3000)

        clientSocket.on("device:created", (data) => {
          clearTimeout(timeout)
          resolve(data)
        })
      })

      // Create device via HTTP API
      const response = await request(app)
        .post("/api/devices")
        .send(deviceData)
        .expect(201)

      // Wait for WebSocket event
      const eventData = await eventPromise

      // Verify event data matches created device
      expect(eventData).toEqual({
        id: response.body.id,
        name: "Test Device",
        mac: "AA:BB:CC:DD:EE:FF",
        status: "ATIVO",
        createdAt: response.body.createdAt,
        updatedAt: response.body.updatedAt,
      })
    }, 10000)

    it("should emit device:created event to all connected clients", async () => {
      const deviceData = {
        name: "Multi Client Test",
        mac: "BB:CC:DD:EE:FF:AA",
      }

      // Create second client
      const secondClient = Client(`http://localhost:${port}`)
      await new Promise<void>((resolve) => {
        secondClient.on("connect", () => resolve())
      })

      // Listen for events on both clients
      const firstClientPromise = new Promise((resolve) => {
        clientSocket.on("device:created", (data) => resolve(data))
      })

      const secondClientPromise = new Promise((resolve) => {
        secondClient.on("device:created", (data) => resolve(data))
      })

      // Create device
      await request(app).post("/api/devices").send(deviceData).expect(201)

      // Both clients should receive the event
      const [firstEvent, secondEvent] = await Promise.all([
        firstClientPromise,
        secondClientPromise,
      ])

      expect(firstEvent).toEqual(secondEvent)
      expect(firstEvent).toMatchObject({
        name: "Multi Client Test",
        mac: "BB:CC:DD:EE:FF:AA",
        status: "ATIVO",
      })

      // Clean up second client
      secondClient.disconnect()
    })
  })

  describe("device:status event emission", () => {
    it("should emit device:status-changed event when device status is toggled", async () => {
      // First create a device
      const deviceData = {
        name: "Status Test Device",
        mac: "CC:DD:EE:FF:AA:BB",
      }

      const createResponse = await request(app)
        .post("/api/devices")
        .send(deviceData)
        .expect(201)

      // Clear any previous events
      clientSocket.removeAllListeners("device:created")

      // Listen for status change event
      const statusEventPromise = new Promise((resolve) => {
        clientSocket.on("device:status-changed", (data) => {
          resolve(data)
        })
      })

      // Toggle device status
      const toggleResponse = await request(app)
        .patch(`/api/devices/${createResponse.body.id}/status`)
        .expect(200)

      // Wait for WebSocket event
      const statusEventData = await statusEventPromise

      // Verify event data
      expect(statusEventData).toEqual({
        id: createResponse.body.id,
        status: "INATIVO",
        updatedAt: toggleResponse.body.updatedAt,
      })
    })

    it("should emit device:status-changed event for multiple status toggles", async () => {
      // Create a device
      const deviceData = {
        name: "Multiple Toggle Test",
        mac: "DD:EE:FF:AA:BB:CC",
      }

      const createResponse = await request(app)
        .post("/api/devices")
        .send(deviceData)
        .expect(201)

      // Clear creation event
      clientSocket.removeAllListeners("device:created")

      const statusEvents: unknown[] = []

      // Listen for status change events
      clientSocket.on("device:status-changed", (data) => {
        statusEvents.push(data)
      })

      // Toggle status twice
      const firstToggle = await request(app)
        .patch(`/api/devices/${createResponse.body.id}/status`)
        .expect(200)

      const secondToggle = await request(app)
        .patch(`/api/devices/${createResponse.body.id}/status`)
        .expect(200)

      // Wait a bit for events to be received
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should have received 2 events
      expect(statusEvents).toHaveLength(2)

      // First toggle: ATIVO -> INATIVO
      expect(statusEvents[0]).toEqual({
        id: createResponse.body.id,
        status: "INATIVO",
        updatedAt: firstToggle.body.updatedAt,
      })

      // Second toggle: INATIVO -> ATIVO
      expect(statusEvents[1]).toEqual({
        id: createResponse.body.id,
        status: "ATIVO",
        updatedAt: secondToggle.body.updatedAt,
      })
    })
  })

  describe("real-time communication functionality", () => {
    it("should maintain persistent WebSocket connections", async () => {
      // Verify connection is established
      expect(clientSocket.connected).toBe(true)

      // Create multiple devices and verify events are received
      const devices = [
        { name: "Device 1", mac: "11:22:33:44:55:66" },
        { name: "Device 2", mac: "22:33:44:55:66:77" },
        { name: "Device 3", mac: "33:44:55:66:77:88" },
      ]

      const receivedEvents: DeviceEventData[] = []

      clientSocket.on("device:created", (data) => {
        receivedEvents.push(data)
      })

      // Create devices sequentially
      for (const device of devices) {
        await request(app).post("/api/devices").send(device).expect(201)
      }

      // Wait for all events
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Should have received all 3 events
      expect(receivedEvents).toHaveLength(3)
      expect(receivedEvents.map((e) => e.name)).toEqual([
        "Device 1",
        "Device 2",
        "Device 3",
      ])
    })

    it("should handle client disconnection and reconnection gracefully", async () => {
      // Disconnect client
      clientSocket.disconnect()
      expect(clientSocket.connected).toBe(false)

      // Create device while client is disconnected
      await request(app)
        .post("/api/devices")
        .send({ name: "Disconnected Test", mac: "99:88:77:66:55:44" })
        .expect(201)

      // Reconnect client
      clientSocket.connect()
      await new Promise<void>((resolve) => {
        clientSocket.on("connect", () => resolve())
      })

      expect(clientSocket.connected).toBe(true)

      // Verify new events are received after reconnection
      const eventPromise = new Promise((resolve) => {
        clientSocket.on("device:created", (data) => resolve(data))
      })

      await request(app)
        .post("/api/devices")
        .send({ name: "Reconnected Test", mac: "88:77:66:55:44:33" })
        .expect(201)

      const eventData = await eventPromise
      expect(eventData).toMatchObject({
        name: "Reconnected Test",
        mac: "88:77:66:55:44:33",
      })
    })

    it("should broadcast events to multiple clients simultaneously", async () => {
      // Create additional clients
      const clients = await Promise.all([
        Client(`http://localhost:${port}`),
        Client(`http://localhost:${port}`),
        Client(`http://localhost:${port}`),
      ])

      // Wait for all clients to connect
      await Promise.all(
        clients.map(
          (client) =>
            new Promise<void>((resolve) => {
              client.on("connect", () => resolve())
            })
        )
      )

      const receivedEvents = clients.map(() => [] as unknown[])

      // Setup event listeners for all clients
      clients.forEach((client, index) => {
        client.on("device:created", (data) => {
          receivedEvents[index].push(data)
        })
      })

      // Also listen on the main client
      const mainClientEvents: unknown[] = []
      clientSocket.on("device:created", (data) => {
        mainClientEvents.push(data)
      })

      // Create a device
      await request(app)
        .post("/api/devices")
        .send({ name: "Broadcast Test", mac: "AA:AA:BB:BB:CC:CC" })
        .expect(201)

      // Wait for events to propagate
      await new Promise((resolve) => setTimeout(resolve, 200))

      // All clients should have received the event
      expect(mainClientEvents).toHaveLength(1)
      receivedEvents.forEach((events) => {
        expect(events).toHaveLength(1)
        expect(events[0]).toMatchObject({
          name: "Broadcast Test",
          mac: "AA:AA:BB:BB:CC:CC",
          status: "ATIVO",
        })
      })

      // Clean up additional clients
      clients.forEach((client) => client.disconnect())
    })
  })
})
