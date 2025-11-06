import { Router, type Router as ExpressRouter } from "express"
import { deviceRouter } from "./device.routes"
import { lunchReservationRouter } from "./lunchReservation.routes"

/**
 * Creates the main application router with all module routes
 * @returns Configured Express router with all routes
 */
export function applicationRouter(): ExpressRouter {
  const router: ExpressRouter = Router()

  // Device routes
  router.use("/devices", deviceRouter)

  // Lunch reservation routes
  router.use("/lunch-reservation", lunchReservationRouter)

  return router
}
