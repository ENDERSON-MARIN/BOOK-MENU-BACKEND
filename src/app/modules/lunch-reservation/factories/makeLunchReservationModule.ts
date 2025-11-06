import { prisma } from "@/infrastructure/database/prisma"

// Import all repositories
import { PrismaUserRepository } from "@/app/modules/lunch-reservation/infrastructure/repositories/PrismaUserRepository"
import { PrismaCategoryRepository } from "@/app/modules/lunch-reservation/infrastructure/repositories/PrismaCategoryRepository"
import { PrismaMenuItemRepository } from "@/app/modules/lunch-reservation/infrastructure/repositories/PrismaMenuItemRepository"
import { PrismaWeekDayRepository } from "@/app/modules/lunch-reservation/infrastructure/repositories/PrismaWeekDayRepository"
import { PrismaMenuRepository } from "@/app/modules/lunch-reservation/infrastructure/repositories/PrismaMenuRepository"
import { PrismaReservationRepository } from "@/app/modules/lunch-reservation/infrastructure/repositories/PrismaReservationRepository"

// Import all services
import { AuthenticationService } from "@/app/modules/lunch-reservation/domain/services/AuthenticationService"
import { UserManagementService } from "@/app/modules/lunch-reservation/domain/services/UserManagementService"
import { CategoryManagementService } from "@/app/modules/lunch-reservation/domain/services/CategoryManagementService"
import { MenuItemManagementService } from "@/app/modules/lunch-reservation/domain/services/MenuItemManagementService"
import { WeekDayManagementService } from "@/app/modules/lunch-reservation/domain/services/WeekDayManagementService"
import { MenuManagementService } from "@/app/modules/lunch-reservation/domain/services/MenuManagementService"
import { ReservationService } from "@/app/modules/lunch-reservation/domain/services/ReservationService"
import { AutoReservationService } from "@/app/modules/lunch-reservation/domain/services/AutoReservationService"

// Import all controllers
import { AuthController } from "@/infrastructure/http/controllers/AuthController"
import { UserController } from "@/infrastructure/http/controllers/UserController"
import { CategoryController } from "@/infrastructure/http/controllers/CategoryController"
import { MenuItemController } from "@/infrastructure/http/controllers/MenuItemController"
import { WeekDayController } from "@/infrastructure/http/controllers/WeekDayController"
import { MenuController } from "@/infrastructure/http/controllers/MenuController"
import { ReservationController } from "@/infrastructure/http/controllers/ReservationController"

import {
  LunchReservationModule,
  LunchReservationModuleFactory,
  FactoryConfig,
} from "./types"

/**
 * Factory function that creates and wires all dependencies for the Lunch Reservation module
 * Follows the dependency injection pattern: Secondary Adapters -> Core Services -> Primary Adapters
 *
 * @param config Optional configuration for custom database client and environment settings
 * @returns LunchReservationModule interface containing all wired dependencies
 *
 * Requirements addressed:
 * - 1.1: Encapsulates instantiation logic for all module components
 * - 2.1: Follows proper instantiation order (repository -> service -> controller)
 * - 3.1: Returns typed interface with all necessary instances
 * - 4.1: Integrates all lunch reservation services and controllers
 * - 5.1: Provides centralized dependency injection
 * - 6.1: Supports auto reservation scheduling
 */
export const makeLunchReservationModule: LunchReservationModuleFactory = (
  config?: FactoryConfig
): LunchReservationModule => {
  try {
    // 1. Secondary Adapters (Infrastructure layer)
    // Use provided database client or default prisma instance
    const databaseClient = config?.database || prisma

    // Initialize all repositories
    const userRepository = new PrismaUserRepository(databaseClient)
    const categoryRepository = new PrismaCategoryRepository(databaseClient)
    const menuItemRepository = new PrismaMenuItemRepository(databaseClient)
    const weekDayRepository = new PrismaWeekDayRepository(databaseClient)
    const menuRepository = new PrismaMenuRepository(databaseClient)
    const reservationRepository = new PrismaReservationRepository(
      databaseClient
    )

    // 2. Core Services (Application layer)
    // Inject repository dependencies into services
    const authenticationService = new AuthenticationService(userRepository)
    const userManagementService = new UserManagementService(
      userRepository,
      authenticationService
    )
    const categoryManagementService = new CategoryManagementService(
      categoryRepository
    )
    const menuItemManagementService = new MenuItemManagementService(
      menuItemRepository,
      categoryRepository
    )
    const weekDayManagementService = new WeekDayManagementService(
      weekDayRepository
    )
    const menuManagementService = new MenuManagementService(
      menuRepository,
      menuItemRepository,
      weekDayManagementService
    )
    const reservationService = new ReservationService(
      reservationRepository,
      menuRepository,
      userRepository
    )
    const autoReservationService = new AutoReservationService(
      reservationRepository,
      userRepository,
      menuRepository,
      weekDayManagementService
    )

    // 3. Primary Adapters (Interface layer)
    // Inject service dependencies into controllers
    const authController = new AuthController(authenticationService)
    const userController = new UserController(userManagementService)
    const categoryController = new CategoryController(categoryManagementService)
    const menuItemController = new MenuItemController(menuItemManagementService)
    const weekDayController = new WeekDayController(weekDayManagementService)
    const menuController = new MenuController(menuManagementService)
    const reservationController = new ReservationController(reservationService)

    // Validate all dependencies were created successfully
    validateDependencies([
      userRepository,
      categoryRepository,
      menuItemRepository,
      weekDayRepository,
      menuRepository,
      reservationRepository,
      authenticationService,
      userManagementService,
      categoryManagementService,
      menuItemManagementService,
      weekDayManagementService,
      menuManagementService,
      reservationService,
      autoReservationService,
      authController,
      userController,
      categoryController,
      menuItemController,
      weekDayController,
      menuController,
      reservationController,
    ])

    return {
      // Controllers
      authController,
      userController,
      categoryController,
      menuItemController,
      weekDayController,
      menuController,
      reservationController,

      // Services
      authenticationService,
      userManagementService,
      categoryManagementService,
      menuItemManagementService,
      weekDayManagementService,
      menuManagementService,
      reservationService,
      autoReservationService,
    }
  } catch (error) {
    throw new Error(
      `Failed to create Lunch Reservation module: ${error instanceof Error ? error.message : "Unknown error"}`
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
      throw new Error(`Dependency at index ${index} is null or undefined`)
    }
  })
}

// Export types for external use
export type {
  LunchReservationModule,
  LunchReservationModuleFactory,
  FactoryConfig,
}
