import { Router, type Router as ExpressRouter } from "express"
import { authRouter } from "./auth.routes"
import { deviceRouter } from "./device.routes"
import { lunchReservationRouter } from "./lunchReservation.routes"
import { cronRouter } from "./cron.routes"

/**
 * Creates the main application router with all module routes
 * @returns Configured Express router with all routes
 */
export function applicationRouter(): ExpressRouter {
  const router: ExpressRouter = Router()

  // Authentication routes
  router.use("/auth", authRouter)

  // Device routes
  router.use("/devices", deviceRouter)

  // Lunch reservation routes
  router.use("/lunch-reservation", lunchReservationRouter)

  // Cron jobs routes (for Vercel Cron)
  router.use("/cron", cronRouter)

  return router
}
