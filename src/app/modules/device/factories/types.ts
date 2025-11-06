import { PrismaClient } from "@prisma/client"
import { DeviceController } from "../../../../infrastructure/http/controllers/DeviceController"
import { DeviceService } from "../DeviceService"
import { WebSocketService } from "../../../../infrastructure/websocket/WebSocketService"

/**
 * Configuration interface for factory functions
 * Allows injection of custom dependencies for different environments
 */
export interface FactoryConfig {
  /** Custom database client for testing or different environments */
  database?: PrismaClient
  /** Custom WebSocket service for testing or different environments */
  websocketService?: WebSocketService
  /** Environment specification for conditional behavior */
  environment?: "development" | "test" | "production"
}

/**
 * Interface defining the structure returned by the Device module factory
 * Contains all the primary adapters and core services for the Device module
 */
export interface DeviceModule {
  /** HTTP controller for handling Device-related requests */
  deviceController: DeviceController
  /** Core business logic service for Device operations */
  deviceService: DeviceService
}

/**
 * Generic module factory interface
 * Defines the contract that all module factories should follow
 */
export interface ModuleFactory<T> {
  (config?: FactoryConfig): T
}

/**
 * Type alias for the Device module factory function
 */
export type DeviceModuleFactory = ModuleFactory<DeviceModule>
