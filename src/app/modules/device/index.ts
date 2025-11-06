// Domain exports
export * from "./domain"

// DTO exports
export * from "./dtos"

// Service exports
export * from "./DeviceService"

// Factory exports - provides centralized dependency injection
export * from "./factories"

// Explicit factory export for backward compatibility
export { makeDeviceModule } from "./factories/makeDeviceModule"
