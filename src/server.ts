import { Express } from "express"
import { createServer as createHttpServer } from "http"
import { createServer } from "./infrastructure/http/server"
import { applicationRouter } from "./infrastructure/http/routes"
import { WebSocketService } from "./infrastructure/websocket"
import {
  initializeAutoReservationScheduler,
  shutdownAutoReservationScheduler,
} from "./app/modules"
import { devLog } from "./app/shared"

// --- Central Composition Point (Where the Magic Happens) ---
// Create Main Router (factories are called within individual route modules)
const appRouter = applicationRouter()

// Create Express app and HTTP server
const app: Express = createServer(appRouter)
const httpServer = createHttpServer(app)

// Initialize WebSocket service
const webSocketService = new WebSocketService(httpServer)

// Make WebSocket service available globally for dependency injection
declare global {
  var webSocketService: WebSocketService
}
global.webSocketService = webSocketService

// Initialize Auto Reservation Scheduler
const autoReservationScheduler = initializeAutoReservationScheduler()

const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  devLog(`✅ Server running on http://localhost:${PORT}`)
  devLog(`📚 API Documentation available at http://localhost:${PORT}/api-docs`)
  devLog(`🔌 WebSocket server initialized`)
})

// Graceful shutdown handling
process.on("SIGTERM", () => {
  devLog("🛑 SIGTERM received, shutting down gracefully...")
  shutdownAutoReservationScheduler(autoReservationScheduler)
  httpServer.close(() => {
    devLog("✅ Server closed successfully")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  devLog("🛑 SIGINT received, shutting down gracefully...")
  shutdownAutoReservationScheduler(autoReservationScheduler)
  httpServer.close(() => {
    devLog("✅ Server closed successfully")
    process.exit(0)
  })
})
