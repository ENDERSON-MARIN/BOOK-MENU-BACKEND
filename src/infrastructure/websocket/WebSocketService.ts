import { Server as HttpServer } from "http"
import { Server as SocketIOServer, Socket } from "socket.io"
import { Device } from "@/app/modules/device"

export class WebSocketService {
  private io: SocketIOServer

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`)

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`)
      })
    })
  }

  // Device operation events
  public emitDeviceCreated(device: Device): void {
    this.io.emit("device:created", {
      id: device.id,
      name: device.name,
      mac: device.mac,
      status: device.status,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    })
  }

  public emitDeviceUpdated(device: Device): void {
    this.io.emit("device:updated", {
      id: device.id,
      name: device.name,
      mac: device.mac,
      status: device.status,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    })
  }

  public emitDeviceDeleted(deviceId: string): void {
    this.io.emit("device:deleted", { id: deviceId })
  }

  public emitDeviceStatusChanged(device: Device): void {
    this.io.emit("device:status-changed", {
      id: device.id,
      status: device.status,
      updatedAt: device.updatedAt,
    })
  }

  public getIO(): SocketIOServer {
    return this.io
  }
}
