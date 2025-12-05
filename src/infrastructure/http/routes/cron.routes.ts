import { Router, Request, Response, type IRouter } from "express"
import { makeLunchReservationModule } from "@/app/modules"

const cronRouter: IRouter = Router()

/**
 * Vercel Cron Job endpoint for auto reservations
 * Executes daily at midnight (configured in vercel.json)
 *
 * Security: Vercel automatically adds Authorization header with cron secret
 */
cronRouter.post("/auto-reservations", async (req: Request, res: Response) => {
  try {
    // Verify request is from Vercel Cron (production only)
    if (process.env.NODE_ENV === "production") {
      const authHeader = req.headers.authorization
      const cronSecret = process.env.CRON_SECRET

      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized - Invalid cron secret",
        })
      }
    }

    console.log("🕐 Executing scheduled auto reservations via Vercel Cron...")

    // Get the auto reservation service
    const lunchReservationModule = makeLunchReservationModule()
    const autoReservationService = lunchReservationModule.autoReservationService

    // Execute auto reservations
    const result =
      await autoReservationService.processScheduledAutoReservations()

    console.log("✅ Auto reservations completed:", {
      totalUsers: result.totalUsers,
      successful: result.successfulReservations,
      failed: result.failedReservations,
      processedAt: result.processedAt,
    })

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: result.totalUsers,
        successfulReservations: result.successfulReservations,
        failedReservations: result.failedReservations,
        processedAt: result.processedAt,
        results: result.results,
      },
    })
  } catch (error) {
    console.error("❌ Error executing auto reservations:", error)

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

/**
 * Manual trigger endpoint for testing (development only)
 */
cronRouter.post(
  "/auto-reservations/manual",
  async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        error: "Manual trigger not allowed in production",
      })
    }

    try {
      console.log("🔧 Manual trigger: Executing auto reservations...")

      const lunchReservationModule = makeLunchReservationModule()
      const autoReservationService =
        lunchReservationModule.autoReservationService

      const result =
        await autoReservationService.processScheduledAutoReservations()

      return res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error("❌ Error in manual trigger:", error)

      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
)

/**
 * Create reservations for specific date
 */
cronRouter.post(
  "/auto-reservations/date",
  async (req: Request, res: Response) => {
    try {
      const { date } = req.body

      if (!date) {
        return res.status(400).json({
          success: false,
          error: "Date is required",
        })
      }

      const targetDate = new Date(date)

      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: "Invalid date format",
        })
      }

      console.log(
        `🗓️ Creating auto reservations for date: ${targetDate.toISOString()}`
      )

      const lunchReservationModule = makeLunchReservationModule()
      const autoReservationService =
        lunchReservationModule.autoReservationService

      const result =
        await autoReservationService.createAutoReservationsForDate(targetDate)

      return res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error("❌ Error creating reservations for date:", error)

      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
)

export { cronRouter }
