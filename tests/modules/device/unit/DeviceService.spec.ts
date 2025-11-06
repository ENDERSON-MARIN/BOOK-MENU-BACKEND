import { describe, it, expect, beforeEach, vi } from "vitest"
import { DeviceService } from "@/app/modules/device"
import {
  DeviceRepository,
  Device,
  DeviceStatus,
} from "@/app/modules/device/domain"
import { AppError } from "@/app/shared"

// Mock do repositório
const mockRepository: DeviceRepository = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  findByMac: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

// Mock do WebSocket service
const mockWebSocketService = {
  emitDeviceCreated: vi.fn(),
  emitDeviceStatusChanged: vi.fn(),
}

describe("DeviceService", () => {
  let service: DeviceService
  let serviceWithWebSocket: DeviceService

  beforeEach(() => {
    service = new DeviceService(mockRepository)
    serviceWithWebSocket = new DeviceService(
      mockRepository,
      mockWebSocketService
    )
    vi.clearAllMocks()
  })

  describe("create", () => {
    it("should create a new device", async () => {
      const createDTO = {
        name: "Test Device",
        mac: "AA:BB:CC:DD:EE:FF",
      }

      const createdDevice = new Device(
        "123",
        createDTO.name,
        createDTO.mac,
        DeviceStatus.ATIVO,
        new Date()
      )

      vi.mocked(mockRepository.findByMac).mockResolvedValue(null)
      vi.mocked(mockRepository.create).mockResolvedValue(createdDevice)

      const result = await service.create(createDTO)

      expect(mockRepository.findByMac).toHaveBeenCalledWith(createDTO.mac)
      expect(mockRepository.create).toHaveBeenCalled()
      expect(result).toEqual(createdDevice)
    })

    it("should throw error if MAC address already exists", async () => {
      const createDTO = {
        name: "Test Device",
        mac: "AA:BB:CC:DD:EE:FF",
      }

      const existingDevice = new Device(
        "456",
        "Existing Device",
        createDTO.mac,
        DeviceStatus.ATIVO,
        new Date()
      )

      vi.mocked(mockRepository.findByMac).mockResolvedValue(existingDevice)

      await expect(service.create(createDTO)).rejects.toThrow(AppError)
      await expect(service.create(createDTO)).rejects.toThrow(
        "Device with this MAC address already exists"
      )
      expect(mockRepository.create).not.toHaveBeenCalled()
    })

    it("should emit WebSocket event when WebSocket service is available", async () => {
      const createDTO = {
        name: "Test Device",
        mac: "AA:BB:CC:DD:EE:FF",
      }

      const createdDevice = new Device(
        "123",
        createDTO.name,
        createDTO.mac,
        DeviceStatus.ATIVO,
        new Date()
      )

      vi.mocked(mockRepository.findByMac).mockResolvedValue(null)
      vi.mocked(mockRepository.create).mockResolvedValue(createdDevice)

      await serviceWithWebSocket.create(createDTO)

      expect(mockWebSocketService.emitDeviceCreated).toHaveBeenCalledWith(
        createdDevice
      )
    })

    it("should not emit WebSocket event when WebSocket service is not available", async () => {
      const createDTO = {
        name: "Test Device",
        mac: "AA:BB:CC:DD:EE:FF",
      }

      const createdDevice = new Device(
        "123",
        createDTO.name,
        createDTO.mac,
        DeviceStatus.ATIVO,
        new Date()
      )

      vi.mocked(mockRepository.findByMac).mockResolvedValue(null)
      vi.mocked(mockRepository.create).mockResolvedValue(createdDevice)

      await service.create(createDTO)

      expect(mockWebSocketService.emitDeviceCreated).not.toHaveBeenCalled()
    })
  })

  describe("findAll", () => {
    it("should return all devices", async () => {
      const devices = [
        new Device(
          "1",
          "Device 1",
          "AA:BB:CC:DD:EE:FF",
          DeviceStatus.ATIVO,
          new Date()
        ),
        new Device(
          "2",
          "Device 2",
          "11:22:33:44:55:66",
          DeviceStatus.INATIVO,
          new Date()
        ),
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(devices)

      const result = await service.findAll()

      expect(mockRepository.findAll).toHaveBeenCalled()
      expect(result).toEqual(devices)
      expect(result).toHaveLength(2)
    })

    it("should return empty array when no devices exist", async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue([])

      const result = await service.findAll()

      expect(result).toEqual([])
    })
  })

  describe("findById", () => {
    it("should return a device by id", async () => {
      const device = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.ATIVO,
        new Date()
      )

      vi.mocked(mockRepository.findById).mockResolvedValue(device)

      const result = await service.findById("123")

      expect(mockRepository.findById).toHaveBeenCalledWith("123")
      expect(result).toEqual(device)
    })

    it("should throw error if device not found", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(service.findById("999")).rejects.toThrow(AppError)
      await expect(service.findById("999")).rejects.toThrow("Device not found")
    })
  })

  describe("toggleStatus", () => {
    it("should toggle device status", async () => {
      const device = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.ATIVO,
        new Date()
      )

      const updatedDevice = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.INATIVO,
        new Date()
      )

      vi.mocked(mockRepository.findById).mockResolvedValue(device)
      vi.mocked(mockRepository.update).mockResolvedValue(updatedDevice)

      const result = await service.toggleStatus("123")

      expect(mockRepository.findById).toHaveBeenCalledWith("123")
      expect(mockRepository.update).toHaveBeenCalledWith("123", device)
      expect(result).toEqual(updatedDevice)
    })

    it("should throw error if device not found", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(service.toggleStatus("999")).rejects.toThrow(AppError)
      await expect(service.toggleStatus("999")).rejects.toThrow(
        "Device not found"
      )
      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it("should emit WebSocket event when WebSocket service is available", async () => {
      const device = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.ATIVO,
        new Date()
      )

      const updatedDevice = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.INATIVO,
        new Date()
      )

      vi.mocked(mockRepository.findById).mockResolvedValue(device)
      vi.mocked(mockRepository.update).mockResolvedValue(updatedDevice)

      await serviceWithWebSocket.toggleStatus("123")

      expect(mockWebSocketService.emitDeviceStatusChanged).toHaveBeenCalledWith(
        updatedDevice
      )
    })

    it("should not emit WebSocket event when WebSocket service is not available", async () => {
      const device = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.ATIVO,
        new Date()
      )

      const updatedDevice = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.INATIVO,
        new Date()
      )

      vi.mocked(mockRepository.findById).mockResolvedValue(device)
      vi.mocked(mockRepository.update).mockResolvedValue(updatedDevice)

      await service.toggleStatus("123")

      expect(
        mockWebSocketService.emitDeviceStatusChanged
      ).not.toHaveBeenCalled()
    })
  })
})
