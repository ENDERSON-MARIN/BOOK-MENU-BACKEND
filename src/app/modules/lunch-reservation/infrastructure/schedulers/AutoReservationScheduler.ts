import {
  AutoReservationService,
  AutoReservationBatchResult,
} from "../../domain/services/AutoReservationService"

export interface SchedulerConfig {
  enabled: boolean
  dailyExecutionHour: number // Hour in 24h format (0-23)
  dailyExecutionMinute: number // Minute (0-59)
  retryAttempts: number
  retryDelayMs: number
  timezone?: string
}

export interface SchedulerStatus {
  isRunning: boolean
  lastExecution?: Date
  nextExecution?: Date
  lastResult?: AutoReservationBatchResult
  consecutiveFailures: number
}

export class AutoReservationScheduler {
  private timer: NodeJS.Timeout | null = null
  private isRunning = false
  private status: SchedulerStatus = {
    isRunning: false,
    consecutiveFailures: 0,
  }

  constructor(
    private autoReservationService: AutoReservationService,
    private config: SchedulerConfig = {
      enabled: true,
      dailyExecutionHour: 0, // Midnight
      dailyExecutionMinute: 0,
      retryAttempts: 3,
      retryDelayMs: 5000, // 5 seconds
    }
  ) {}

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log("AutoReservationScheduler is already running")
      return
    }

    if (!this.config.enabled) {
      console.log("AutoReservationScheduler is disabled")
      return
    }

    this.isRunning = true
    this.status.isRunning = true
    this.scheduleNext()
    console.log("AutoReservationScheduler started")
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    this.isRunning = false
    this.status.isRunning = false
    console.log("AutoReservationScheduler stopped")
  }

  /**
   * Check if scheduler is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * Get current scheduler status
   */
  getStatus(): SchedulerStatus {
    return { ...this.status }
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig }

    if (this.isRunning) {
      // Restart with new config
      this.stop()
      this.start()
    }
  }

  /**
   * Execute auto reservations manually (for testing or manual triggers)
   */
  async executeNow(): Promise<AutoReservationBatchResult> {
    console.log("Executing auto reservations manually...")
    return await this.executeAutoReservations()
  }

  /**
   * Schedule the next execution
   */
  private scheduleNext(): void {
    if (!this.isRunning) {
      return
    }

    const nextExecution = this.calculateNextExecution()
    const delay = nextExecution.getTime() - Date.now()

    this.status.nextExecution = nextExecution

    this.timer = setTimeout(async () => {
      await this.executeScheduledTask()
      this.scheduleNext() // Schedule the next execution
    }, delay)

    console.log(
      `Next auto reservation execution scheduled for: ${nextExecution.toISOString()}`
    )
  }

  /**
   * Calculate the next execution time
   */
  private calculateNextExecution(): Date {
    const now = new Date()
    const next = new Date()

    next.setHours(
      this.config.dailyExecutionHour,
      this.config.dailyExecutionMinute,
      0,
      0
    )

    // If the scheduled time for today has already passed, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }

    return next
  }

  /**
   * Execute the scheduled task with retry logic
   */
  private async executeScheduledTask(): Promise<void> {
    console.log("Executing scheduled auto reservations...")

    try {
      const result = await this.executeAutoReservations()
      this.handleExecutionSuccess(result)
    } catch (error) {
      this.handleExecutionFailure(error)
    }
  }

  /**
   * Execute auto reservations with retry logic
   */
  private async executeAutoReservations(): Promise<AutoReservationBatchResult> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.log(
          `Auto reservation attempt ${attempt}/${this.config.retryAttempts}`
        )

        const result =
          await this.autoReservationService.processScheduledAutoReservations()

        console.log(`Auto reservations completed successfully:`, {
          totalUsers: result.totalUsers,
          successful: result.successfulReservations,
          failed: result.failedReservations,
          processedAt: result.processedAt,
        })

        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(
          `Auto reservation attempt ${attempt} failed:`,
          lastError.message
        )

        // Wait before retrying (except on the last attempt)
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelayMs)
        }
      }
    }

    // All attempts failed
    throw lastError || new Error("All auto reservation attempts failed")
  }

  /**
   * Handle successful execution
   */
  private handleExecutionSuccess(result: AutoReservationBatchResult): void {
    this.status.lastExecution = new Date()
    this.status.lastResult = result
    this.status.consecutiveFailures = 0

    console.log("Auto reservation execution completed successfully")
  }

  /**
   * Handle execution failure
   */
  private handleExecutionFailure(error: unknown): void {
    this.status.lastExecution = new Date()
    this.status.consecutiveFailures++

    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(
      `Auto reservation execution failed (${this.status.consecutiveFailures} consecutive failures):`,
      errorMessage
    )

    // You could implement additional failure handling here, such as:
    // - Sending alerts after a certain number of consecutive failures
    // - Disabling the scheduler after too many failures
    // - Logging to external monitoring systems

    if (this.status.consecutiveFailures >= 5) {
      console.error(
        "Too many consecutive failures. Consider checking the system."
      )
    }
  }

  /**
   * Utility method to create a delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get scheduler health information
   */
  getHealthInfo(): {
    isHealthy: boolean
    status: SchedulerStatus
    config: SchedulerConfig
    uptime?: number
  } {
    const isHealthy =
      this.status.isRunning && this.status.consecutiveFailures < 3

    return {
      isHealthy,
      status: this.getStatus(),
      config: { ...this.config },
      uptime: this.status.lastExecution
        ? Date.now() - this.status.lastExecution.getTime()
        : undefined,
    }
  }

  /**
   * Force retry failed reservations from last execution
   */
  async retryLastFailedReservations(): Promise<AutoReservationBatchResult | null> {
    if (!this.status.lastResult) {
      console.log("No previous execution result to retry")
      return null
    }

    console.log("Retrying failed reservations from last execution...")

    try {
      const retryResult =
        await this.autoReservationService.retryFailedAutoReservations(
          this.status.lastResult
        )

      console.log("Retry completed:", {
        successful: retryResult.successfulReservations,
        failed: retryResult.failedReservations,
      })

      return retryResult
    } catch (error) {
      console.error("Failed to retry reservations:", error)
      throw error
    }
  }

  /**
   * Create reservations for a specific date (useful for manual operations)
   */
  async createReservationsForDate(
    date: Date
  ): Promise<AutoReservationBatchResult> {
    console.log(
      `Creating auto reservations for specific date: ${date.toISOString()}`
    )

    try {
      const result =
        await this.autoReservationService.createAutoReservationsForDate(date)

      console.log(`Manual reservations for ${date.toDateString()} completed:`, {
        totalUsers: result.totalUsers,
        successful: result.successfulReservations,
        failed: result.failedReservations,
      })

      return result
    } catch (error) {
      console.error(
        `Failed to create reservations for ${date.toDateString()}:`,
        error
      )
      throw error
    }
  }

  /**
   * Create reservations for a date range (useful for bulk operations)
   */
  async createReservationsForDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AutoReservationBatchResult[]> {
    console.log(
      `Creating auto reservations for date range: ${startDate.toDateString()} to ${endDate.toDateString()}`
    )

    try {
      const results =
        await this.autoReservationService.createAutoReservationsForDateRange(
          startDate,
          endDate
        )

      const totalSuccessful = results.reduce(
        (sum, r) => sum + r.successfulReservations,
        0
      )
      const totalFailed = results.reduce(
        (sum, r) => sum + r.failedReservations,
        0
      )

      console.log(`Bulk reservations completed:`, {
        daysProcessed: results.length,
        totalSuccessful,
        totalFailed,
      })

      return results
    } catch (error) {
      console.error(`Failed to create reservations for date range:`, error)
      throw error
    }
  }
}
