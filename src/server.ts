import { Express } from "express"
import { createServer as createHttpServer } from "http"
import { createServer } from "./infrastructure/http/server"
import { applicationRouter } from "./infrastructure/http/routes"
import { WebSocketService } from "./infrastructure/websocket"
import {
  initializeAutoReservationScheduler,
  shutdownAutoReservationScheduler,
} from "./app/modules"

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
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/api-docs`
  )
  console.log(`🔌 WebSocket server initialized`)
})

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...")
  shutdownAutoReservationScheduler(autoReservationScheduler)
  httpServer.close(() => {
    console.log("✅ Server closed successfully")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...")
  shutdownAutoReservationScheduler(autoReservationScheduler)
  httpServer.close(() => {
    console.log("✅ Server closed successfully")
    process.exit(0)
  })
})
