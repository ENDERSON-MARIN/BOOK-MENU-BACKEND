import { Router, type Router as ExpressRouter } from "express"
import { makeDeviceModule } from "@/app/modules/device"

const deviceRouter: ExpressRouter = Router()

// Initialize device module with WebSocket service if available
const { deviceController } = makeDeviceModule({
  websocketService: global.webSocketService,
})

// Device routes
deviceRouter.post("/", deviceController.create.bind(deviceController))
deviceRouter.get("/", deviceController.getAll.bind(deviceController))
deviceRouter.patch(
  "/:id/status",
  deviceController.toggleStatus.bind(deviceController)
)

export { deviceRouter }
