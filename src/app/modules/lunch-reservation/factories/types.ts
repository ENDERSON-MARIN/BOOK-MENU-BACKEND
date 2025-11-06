import { PrismaClient } from "@prisma/client"

// Import all controllers
import { AuthController } from "@/infrastructure/http/controllers/AuthController"
import { UserController } from "@/infrastructure/http/controllers/UserController"
import { CategoryController } from "@/infrastructure/http/controllers/CategoryController"
import { MenuItemController } from "@/infrastructure/http/controllers/MenuItemController"
import { WeekDayController } from "@/infrastructure/http/controllers/WeekDayController"
import { MenuController } from "@/infrastructure/http/controllers/MenuController"
import { ReservationController } from "@/infrastructure/http/controllers/ReservationController"

// Import all services
import { AuthenticationService } from "@/app/modules/lunch-reservation/domain/services/AuthenticationService"
import { UserManagementService } from "@/app/modules/lunch-reservation/domain/services/UserManagementService"
import { CategoryManagementService } from "@/app/modules/lunch-reservation/domain/services/CategoryManagementService"
import { MenuItemManagementService } from "@/app/modules/lunch-reservation/domain/services/MenuItemManagementService"
import { WeekDayManagementService } from "@/app/modules/lunch-reservation/domain/services/WeekDayManagementService"
import { MenuManagementService } from "@/app/modules/lunch-reservation/domain/services/MenuManagementService"
import { ReservationService } from "@/app/modules/lunch-reservation/domain/services/ReservationService"
import { AutoReservationService } from "@/app/modules/lunch-reservation/domain/services/AutoReservationService"

/**
 * Configuration interface for factory functions
 * Allows injection of custom dependencies for different environments
 */
export interface FactoryConfig {
  /** Custom database client for testing or different environments */
  database?: PrismaClient
  /** Environment specification for conditional behavior */
  environment?: "development" | "test" | "production"
}

/**
 * Interface defining the structure returned by the Lunch Reservation module factory
 * Contains all the primary adapters and core services for the Lunch Reservation module
 */
export interface LunchReservationModule {
  // HTTP controllers for handling requests
  authController: AuthController
  userController: UserController
  categoryController: CategoryController
  menuItemController: MenuItemController
  weekDayController: WeekDayController
  menuController: MenuController
  reservationController: ReservationController

  // Core business logic services
  authenticationService: AuthenticationService
  userManagementService: UserManagementService
  categoryManagementService: CategoryManagementService
  menuItemManagementService: MenuItemManagementService
  weekDayManagementService: WeekDayManagementService
  menuManagementService: MenuManagementService
  reservationService: ReservationService
  autoReservationService: AutoReservationService
}

/**
 * Generic module factory interface
 * Defines the contract that all module factories should follow
 */
export interface ModuleFactory<T> {
  (config?: FactoryConfig): T
}

/**
 * Type alias for the Lunch Reservation module factory function
 */
export type LunchReservationModuleFactory =
  ModuleFactory<LunchReservationModule>
