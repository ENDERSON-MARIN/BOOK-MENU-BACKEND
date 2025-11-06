import { prisma } from "@/infrastructure/database/prisma"
import {
  AutoReservationScheduler,
  SchedulerConfig,
} from "../infrastructure/schedulers/AutoReservationScheduler"
import { AutoReservationService } from "../domain/services/AutoReservationService"
import { WeekDayManagementService } from "../domain/services/WeekDayManagementService"
import { PrismaUserRepository } from "../infrastructure/repositories/PrismaUserRepository"
import { PrismaReservationRepository } from "../infrastructure/repositories/PrismaReservationRepository"
import { PrismaMenuRepository } from "../infrastructure/repositories/PrismaMenuRepository"
import { PrismaWeekDayRepository } from "../infrastructure/repositories/PrismaWeekDayRepository"

export interface SchedulerFactoryConfig {
  database?: typeof prisma
  schedulerConfig?: Partial<SchedulerConfig>
}

/**
 * Factory function that creates and wires all dependencies for the AutoReservationScheduler
 * Follows the dependency injection pattern: Repositories -> Services -> Scheduler
 *
 * @param config Optional configuration for custom database client and scheduler settings
 * @returns AutoReservationScheduler instance with all dependencies wired
 *
 * Requirements addressed:
 * - 6.1: Creates job scheduler for daily execution
 * - 6.2: Wires AutoReservationService for creating reservations for fixed users
 * - 6.3: Provides proper dependency injection for all required services
 * - 6.4: Enables configuration of scheduler behavior
 * - 6.5: Supports retry logic and failure handling
 */
export function makeAutoReservationScheduler(
  config?: SchedulerFactoryConfig
): AutoReservationScheduler {
  try {
    // 1. Infrastructure layer - Database repositories
    const databaseClient = config?.database || prisma

    const userRepository = new PrismaUserRepository(databaseClient)
    const reservationRepository = new PrismaReservationRepository(
      databaseClient
    )
    const menuRepository = new PrismaMenuRepository(databaseClient)
    const weekDayRepository = new PrismaWeekDayRepository(databaseClient)

    // 2. Domain services layer
    const weekDayManagementService = new WeekDayManagementService(
      weekDayRepository
    )

    const autoReservationService = new AutoReservationService(
      reservationRepository,
      userRepository,
      menuRepository,
      weekDayManagementService
    )

    // 3. Scheduler configuration
    const schedulerConfig: SchedulerConfig = {
      enabled: true,
      dailyExecutionHour: 0, // Midnight
      dailyExecutionMinute: 0,
      retryAttempts: 3,
      retryDelayMs: 5000, // 5 seconds
      ...config?.schedulerConfig,
    }

    // 4. Create scheduler instance
    const scheduler = new AutoReservationScheduler(
      autoReservationService,
      schedulerConfig
    )

    // Validate all dependencies were created successfully
    validateDependencies([
      userRepository,
      reservationRepository,
      menuRepository,
      weekDayRepository,
      weekDayManagementService,
      autoReservationService,
      scheduler,
    ])

    return scheduler
  } catch (error) {
    throw new Error(
      `Failed to create AutoReservationScheduler: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Validates that all dependencies were successfully instantiated
 * @param dependencies Array of dependency instances to validate
 * @throws Error if any dependency is null or undefined
 */
function validateDependencies(dependencies: unknown[]): void {
  dependencies.forEach((dep, index) => {
    if (!dep) {
      throw new Error(
        `Scheduler dependency at index ${index} is null or undefined`
      )
    }
  })
}

/**
 * Creates a scheduler with default production configuration
 * Executes daily at midnight with standard retry settings
 */
export function makeProductionScheduler(): AutoReservationScheduler {
  return makeAutoReservationScheduler({
    schedulerConfig: {
      enabled: true,
      dailyExecutionHour: 0, // Midnight
      dailyExecutionMinute: 0,
      retryAttempts: 3,
      retryDelayMs: 5000,
    },
  })
}

/**
 * Creates a scheduler with development/testing configuration
 * More frequent execution and shorter retry delays for testing
 */
export function makeDevelopmentScheduler(): AutoReservationScheduler {
  return makeAutoReservationScheduler({
    schedulerConfig: {
      enabled: false, // Disabled by default in development
      dailyExecutionHour: 0,
      dailyExecutionMinute: 0,
      retryAttempts: 2,
      retryDelayMs: 1000, // 1 second for faster testing
    },
  })
}

/**
 * Creates a scheduler for testing purposes
 * Disabled by default and with minimal retry settings
 */
export function makeTestScheduler(): AutoReservationScheduler {
  return makeAutoReservationScheduler({
    schedulerConfig: {
      enabled: false,
      dailyExecutionHour: 0,
      dailyExecutionMinute: 0,
      retryAttempts: 1,
      retryDelayMs: 100, // Very short delay for tests
    },
  })
}
