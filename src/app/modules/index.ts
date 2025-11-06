// Device module exports
export {
  Device,
  DeviceRepository,
  DeviceStatus,
  CreateDeviceDTO,
  DeviceResponseDTO,
  DeviceService,
  makeDeviceModule,
} from "./device"

// Lunch Reservation module exports
export {
  makeLunchReservationModule,
  initializeAutoReservationScheduler,
  shutdownAutoReservationScheduler,
} from "./lunch-reservation"

// Re-export factory types with module-specific names to avoid conflicts
export type {
  DeviceModule,
  DeviceModuleFactory,
} from "./device/factories/types"

export type {
  LunchReservationModule,
  LunchReservationModuleFactory,
} from "./lunch-reservation/factories/types"
