import { PrismaDeviceRepository } from "@/infrastructure/database/repositories/PrismaDeviceRepository"
import { DeviceController } from "@/infrastructure/http/controllers/DeviceController"
import { DeviceService } from "../DeviceService"
import { prisma } from "@/infrastructure/database/prisma"
import { DeviceModule, FactoryConfig, DeviceModuleFactory } from "./types"

/**
 * Factory function that creates and wires all dependencies for the Device module
 * Follows the dependency injection pattern: Secondary Adapters -> Core Services -> Primary Adapters
 *
 * @param config Optional configuration for custom database client, WebSocket service and environment settings
 * @returns DeviceModule interface containing all wired dependencies
 *
 * Requirements addressed:
 * - 1.1: Encapsulates instantiation logic for all module components
 * - 2.1: Follows proper instantiation order (repository -> service -> controller)
 * - 3.1: Returns typed interface with all necessary instances
 * - 4.1: Integrates WebSocket service for real-time communication
 */
export const makeDeviceModule: DeviceModuleFactory = (
  config?: FactoryConfig
): DeviceModule => {
  try {
    // 1. Secondary Adapters (Infrastructure layer)
    // Use provided database client or default prisma instance
    const databaseClient = config?.database || prisma
    const deviceRepository = new PrismaDeviceRepository(databaseClient)

    // Use provided WebSocket service or undefined (optional dependency)
    const websocketService = config?.websocketService

    // 2. Core Services (Application layer)
    // Inject repository and WebSocket service dependencies into service
    const deviceService = new DeviceService(deviceRepository, websocketService)

    // 3. Primary Adapters (Interface layer)
    // Inject service dependency into controller
    const deviceController = new DeviceController(deviceService)

    // Validate all dependencies were created successfully
    validateDependencies([deviceRepository, deviceService, deviceController])

    return {
      deviceController,
      deviceService,
    }
  } catch (error) {
    throw new Error(
      `Failed to create Device module: ${error instanceof Error ? error.message : "Unknown error"}`
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
