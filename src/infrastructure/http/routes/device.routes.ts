import { Router, type IRouter } from "express"
import { makeDeviceModule } from "@/app/modules/device"
import { authenticate, authorize } from "@/infrastructure/http/middlewares"
import { UserRole } from "@/app/modules/auth/domain/User"

const deviceRouter: IRouter = Router()

// Initialize device module with WebSocket service if available
const { deviceController } = makeDeviceModule({
  websocketService: global.webSocketService,
})

// Device routes - protected with authentication
deviceRouter.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  deviceController.create.bind(deviceController)
)
deviceRouter.get(
  "/",
  authenticate,
  deviceController.getAll.bind(deviceController)
)
deviceRouter.patch(
  "/:id/status",
  authenticate,
  deviceController.toggleStatus.bind(deviceController)
)

export { deviceRouter }
