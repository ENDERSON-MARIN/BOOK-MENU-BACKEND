import {
  makeProductionScheduler,
  makeDevelopmentScheduler,
  makeTestScheduler,
} from "../factories/makeAutoReservationScheduler"
import { AutoReservationScheduler } from "../infrastructure/schedulers/AutoReservationScheduler"

/**
 * Initializes the auto reservation scheduler based on the current environment
 *
 * Requirements addressed:
 * - 6.1: Creates job scheduler for daily execution
 * - 6.2: Implements lógica de criação de reservas para usuários fixos
 * - 6.3: Adds processamento em lote para múltiplos usuários
 * - 6.4: Includes lógica de interrupção quando usuário muda de tipo
 * - 6.5: Provides tratamento de falhas e retry logic
 */
export function initializeAutoReservationScheduler(): AutoReservationScheduler | null {
  const environment = process.env.NODE_ENV || "development"

  try {
    let scheduler: AutoReservationScheduler

    switch (environment) {
      case "production":
        scheduler = makeProductionScheduler()
        console.log("🕐 Auto Reservation Scheduler initialized for PRODUCTION")
        break

      case "development":
        scheduler = makeDevelopmentScheduler()
        console.log(
          "🕐 Auto Reservation Scheduler initialized for DEVELOPMENT (disabled by default)"
        )
        break

      case "test":
        scheduler = makeTestScheduler()
        console.log(
          "🕐 Auto Reservation Scheduler initialized for TEST (disabled)"
        )
        break

      default:
        scheduler = makeDevelopmentScheduler()
        console.log(
          "🕐 Auto Reservation Scheduler initialized with default DEVELOPMENT settings"
        )
        break
    }

    // Start the scheduler if enabled
    if (scheduler.isEnabled()) {
      scheduler.start()
      console.log("✅ Auto Reservation Scheduler started successfully")
    } else {
      console.log(
        "⏸️ Auto Reservation Scheduler is disabled for this environment"
      )
    }

    return scheduler
  } catch (error) {
    console.error("❌ Failed to initialize Auto Reservation Scheduler:", error)
    return null
  }
}

/**
 * Gracefully shuts down the scheduler
 */
export function shutdownAutoReservationScheduler(
  scheduler: AutoReservationScheduler | null
): void {
  if (scheduler) {
    try {
      scheduler.stop()
      console.log("🛑 Auto Reservation Scheduler stopped successfully")
    } catch (error) {
      console.error("❌ Error stopping Auto Reservation Scheduler:", error)
    }
  }
}
