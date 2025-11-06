"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const device_1 = require("@/app/modules/device");
const domain_1 = require("@/app/modules/device/domain");
const shared_1 = require("@/app/shared");
// Mock do repositório
const mockRepository = {
    create: vitest_1.vi.fn(),
    findAll: vitest_1.vi.fn(),
    findById: vitest_1.vi.fn(),
    findByMac: vitest_1.vi.fn(),
    update: vitest_1.vi.fn(),
    delete: vitest_1.vi.fn(),
};
// Mock do WebSocket service
const mockWebSocketService = {
    emitDeviceCreated: vitest_1.vi.fn(),
    emitDeviceStatusChanged: vitest_1.vi.fn(),
};
(0, vitest_1.describe)("DeviceService", () => {
    let service;
    let serviceWithWebSocket;
    (0, vitest_1.beforeEach)(() => {
        service = new device_1.DeviceService(mockRepository);
        serviceWithWebSocket = new device_1.DeviceService(mockRepository, mockWebSocketService);
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)("create", () => {
        (0, vitest_1.it)("should create a new device", async () => {
            const createDTO = {
                name: "Test Device",
                mac: "AA:BB:CC:DD:EE:FF",
            };
            const createdDevice = new domain_1.Device("123", createDTO.name, createDTO.mac, domain_1.DeviceStatus.ATIVO, new Date());
            vitest_1.vi.mocked(mockRepository.findByMac).mockResolvedValue(null);
            vitest_1.vi.mocked(mockRepository.create).mockResolvedValue(createdDevice);
            const result = await service.create(createDTO);
            (0, vitest_1.expect)(mockRepository.findByMac).toHaveBeenCalledWith(createDTO.mac);
            (0, vitest_1.expect)(mockRepository.create).toHaveBeenCalled();
            (0, vitest_1.expect)(result).toEqual(createdDevice);
        });
        (0, vitest_1.it)("should throw error if MAC address already exists", async () => {
            const createDTO = {
                name: "Test Device",
                mac: "AA:BB:CC:DD:EE:FF",
            };
            const existingDevice = new domain_1.Device("456", "Existing Device", createDTO.mac, domain_1.DeviceStatus.ATIVO, new Date());
            vitest_1.vi.mocked(mockRepository.findByMac).mockResolvedValue(existingDevice);
            await (0, vitest_1.expect)(service.create(createDTO)).rejects.toThrow(shared_1.AppError);
            await (0, vitest_1.expect)(service.create(createDTO)).rejects.toThrow("Device with this MAC address already exists");
            (0, vitest_1.expect)(mockRepository.create).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)("should emit WebSocket event when WebSocket service is available", async () => {
            const createDTO = {
                name: "Test Device",
                mac: "AA:BB:CC:DD:EE:FF",
            };
            const createdDevice = new domain_1.Device("123", createDTO.name, createDTO.mac, domain_1.DeviceStatus.ATIVO, new Date());
            vitest_1.vi.mocked(mockRepository.findByMac).mockResolvedValue(null);
            vitest_1.vi.mocked(mockRepository.create).mockResolvedValue(createdDevice);
            await serviceWithWebSocket.create(createDTO);
            (0, vitest_1.expect)(mockWebSocketService.emitDeviceCreated).toHaveBeenCalledWith(createdDevice);
        });
        (0, vitest_1.it)("should not emit WebSocket event when WebSocket service is not available", async () => {
            const createDTO = {
                name: "Test Device",
                mac: "AA:BB:CC:DD:EE:FF",
            };
            const createdDevice = new domain_1.Device("123", createDTO.name, createDTO.mac, domain_1.DeviceStatus.ATIVO, new Date());
            vitest_1.vi.mocked(mockRepository.findByMac).mockResolvedValue(null);
            vitest_1.vi.mocked(mockRepository.create).mockResolvedValue(createdDevice);
            await service.create(createDTO);
            (0, vitest_1.expect)(mockWebSocketService.emitDeviceCreated).not.toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)("findAll", () => {
        (0, vitest_1.it)("should return all devices", async () => {
            const devices = [
                new domain_1.Device("1", "Device 1", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date()),
                new domain_1.Device("2", "Device 2", "11:22:33:44:55:66", domain_1.DeviceStatus.INATIVO, new Date()),
            ];
            vitest_1.vi.mocked(mockRepository.findAll).mockResolvedValue(devices);
            const result = await service.findAll();
            (0, vitest_1.expect)(mockRepository.findAll).toHaveBeenCalled();
            (0, vitest_1.expect)(result).toEqual(devices);
            (0, vitest_1.expect)(result).toHaveLength(2);
        });
        (0, vitest_1.it)("should return empty array when no devices exist", async () => {
            vitest_1.vi.mocked(mockRepository.findAll).mockResolvedValue([]);
            const result = await service.findAll();
            (0, vitest_1.expect)(result).toEqual([]);
        });
    });
    (0, vitest_1.describe)("findById", () => {
        (0, vitest_1.it)("should return a device by id", async () => {
            const device = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date());
            vitest_1.vi.mocked(mockRepository.findById).mockResolvedValue(device);
            const result = await service.findById("123");
            (0, vitest_1.expect)(mockRepository.findById).toHaveBeenCalledWith("123");
            (0, vitest_1.expect)(result).toEqual(device);
        });
        (0, vitest_1.it)("should throw error if device not found", async () => {
            vitest_1.vi.mocked(mockRepository.findById).mockResolvedValue(null);
            await (0, vitest_1.expect)(service.findById("999")).rejects.toThrow(shared_1.AppError);
            await (0, vitest_1.expect)(service.findById("999")).rejects.toThrow("Device not found");
        });
    });
    (0, vitest_1.describe)("toggleStatus", () => {
        (0, vitest_1.it)("should toggle device status", async () => {
            const device = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date());
            const updatedDevice = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.INATIVO, new Date());
            vitest_1.vi.mocked(mockRepository.findById).mockResolvedValue(device);
            vitest_1.vi.mocked(mockRepository.update).mockResolvedValue(updatedDevice);
            const result = await service.toggleStatus("123");
            (0, vitest_1.expect)(mockRepository.findById).toHaveBeenCalledWith("123");
            (0, vitest_1.expect)(mockRepository.update).toHaveBeenCalledWith("123", device);
            (0, vitest_1.expect)(result).toEqual(updatedDevice);
        });
        (0, vitest_1.it)("should throw error if device not found", async () => {
            vitest_1.vi.mocked(mockRepository.findById).mockResolvedValue(null);
            await (0, vitest_1.expect)(service.toggleStatus("999")).rejects.toThrow(shared_1.AppError);
            await (0, vitest_1.expect)(service.toggleStatus("999")).rejects.toThrow("Device not found");
            (0, vitest_1.expect)(mockRepository.update).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)("should emit WebSocket event when WebSocket service is available", async () => {
            const device = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date());
            const updatedDevice = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.INATIVO, new Date());
            vitest_1.vi.mocked(mockRepository.findById).mockResolvedValue(device);
            vitest_1.vi.mocked(mockRepository.update).mockResolvedValue(updatedDevice);
            await serviceWithWebSocket.toggleStatus("123");
            (0, vitest_1.expect)(mockWebSocketService.emitDeviceStatusChanged).toHaveBeenCalledWith(updatedDevice);
        });
        (0, vitest_1.it)("should not emit WebSocket event when WebSocket service is not available", async () => {
            const device = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date());
            const updatedDevice = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.INATIVO, new Date());
            vitest_1.vi.mocked(mockRepository.findById).mockResolvedValue(device);
            vitest_1.vi.mocked(mockRepository.update).mockResolvedValue(updatedDevice);
            await service.toggleStatus("123");
            (0, vitest_1.expect)(mockWebSocketService.emitDeviceStatusChanged).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=DeviceService.spec.js.map