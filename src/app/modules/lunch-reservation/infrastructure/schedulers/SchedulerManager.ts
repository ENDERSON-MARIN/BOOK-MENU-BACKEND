import {
  AutoReservationScheduler,
  SchedulerStatus,
} from "./AutoReservationScheduler"
import {
  makeProductionScheduler,
  makeDevelopmentScheduler,
} from "../../factories"
import { devLog, devError } from "@/app/shared"

export interface SchedulerManagerConfig {
  environment: "production" | "development" | "test"
  autoStart?: boolean
}

/**
 * Manages the lifecycle of the AutoReservationScheduler
 * Provides a centralized way to start, stop, and monitor the scheduler
 */
export class SchedulerManager {
  private scheduler: AutoReservationScheduler | null = null
  private config: SchedulerManagerConfig

  constructor(
    config: SchedulerManagerConfig = {
      environment: "production",
      autoStart: false,
    }
  ) {
    this.config = config
  }

  /**
   * Initialize and optionally start the scheduler
   */
  async initialize(): Promise<void> {
    try {
      // Create scheduler based on environment
      this.scheduler = this.createScheduler()

      devLog(
        `AutoReservationScheduler initialized for ${this.config.environment} environment`
      )

      // Auto-start if configured
      if (this.config.autoStart) {
        this.start()
      }
    } catch (error) {
      devError("Failed to initialize AutoReservationScheduler:", error)
      throw error
    }
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (!this.scheduler) {
      throw new Error("Scheduler not initialized. Call initialize() first.")
    }

    this.scheduler.start()
    devLog("AutoReservationScheduler started")
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.scheduler) {
      devLog("Scheduler not initialized, nothing to stop")
      return
    }

    this.scheduler.stop()
    devLog("AutoReservationScheduler stopped")
  }

  /**
   * Get scheduler status
   */
  getStatus(): SchedulerStatus | null {
    return this.scheduler?.getStatus() || null
  }

  /**
   * Get scheduler health information
   */
  getHealthInfo() {
    return (
      this.scheduler?.getHealthInfo() || {
        isHealthy: false,
        status: { isRunning: false, consecutiveFailures: 0 },
        config: {},
      }
    )
  }

  /**
   * Execute scheduler manually (for testing or manual triggers)
   */
  async executeNow() {
    if (!this.scheduler) {
      throw new Error("Scheduler not initialized. Call initialize() first.")
    }

    return await this.scheduler.executeNow()
  }

  /**
   * Create reservations for a specific date
   */
  async createReservationsForDate(date: Date) {
    if (!this.scheduler) {
      throw new Error("Scheduler not initialized. Call initialize() first.")
    }

    return await this.scheduler.createReservationsForDate(date)
  }

  /**
   * Create reservations for a date range
   */
  async createReservationsForDateRange(startDate: Date, endDate: Date) {
    if (!this.scheduler) {
      throw new Error("Scheduler not initialized. Call initialize() first.")
    }

    return await this.scheduler.createReservationsForDateRange(
      startDate,
      endDate
    )
  }

  /**
   * Retry failed reservations from last execution
   */
  async retryLastFailedReservations() {
    if (!this.scheduler) {
      throw new Error("Scheduler not initialized. Call initialize() first.")
    }

    return await this.scheduler.retryLastFailedReservations()
  }

  /**
   * Gracefully shutdown the scheduler
   */
  async shutdown(): Promise<void> {
    if (this.scheduler) {
      this.stop()
      this.scheduler = null
      devLog("AutoReservationScheduler shutdown completed")
    }
  }

  /**
   * Create scheduler instance based on environment
   */
  private createScheduler(): AutoReservationScheduler {
    switch (this.config.environment) {
      case "production":
        return makeProductionScheduler()
      case "development":
        return makeDevelopmentScheduler()
      case "test":
        // For tests, we'll create a disabled scheduler
        return makeDevelopmentScheduler()
      default:
        throw new Error(`Unknown environment: ${this.config.environment}`)
    }
  }

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.scheduler?.getStatus().isRunning || false
  }

  /**
   * Get scheduler instance (for advanced usage)
   */
  getScheduler(): AutoReservationScheduler | null {
    return this.scheduler
  }
}

// Global scheduler manager instance
let globalSchedulerManager: SchedulerManager | null = null

/**
 * Get or create the global scheduler manager instance
 */
export function getSchedulerManager(
  config?: SchedulerManagerConfig
): SchedulerManager {
  if (!globalSchedulerManager) {
    const environment =
      (process.env.NODE_ENV as "production" | "development" | "test") ||
      "development"
    const autoStart = process.env.AUTO_START_SCHEDULER === "true"

    globalSchedulerManager = new SchedulerManager({
      environment,
      autoStart,
      ...config,
    })
  }

  return globalSchedulerManager
}

/**
 * Initialize the global scheduler manager
 */
export async function initializeGlobalScheduler(
  config?: SchedulerManagerConfig
): Promise<SchedulerManager> {
  const manager = getSchedulerManager(config)
  await manager.initialize()
  return manager
}

/**
 * Shutdown the global scheduler manager
 */
export async function shutdownGlobalScheduler(): Promise<void> {
  if (globalSchedulerManager) {
    await globalSchedulerManager.shutdown()
    globalSchedulerManager = null
  }
}
