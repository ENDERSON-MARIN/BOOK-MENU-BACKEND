"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const domain_1 = require("@/app/modules/device/domain");
(0, vitest_1.describe)("Device", () => {
    (0, vitest_1.describe)("toggleStatus", () => {
        (0, vitest_1.it)("should toggle status from ATIVO to INATIVO", () => {
            const device = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date());
            device.toggleStatus();
            (0, vitest_1.expect)(device.status).toBe(domain_1.DeviceStatus.INATIVO);
        });
        (0, vitest_1.it)("should toggle status from INATIVO to ATIVO", () => {
            const device = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.INATIVO, new Date());
            device.toggleStatus();
            (0, vitest_1.expect)(device.status).toBe(domain_1.DeviceStatus.ATIVO);
        });
    });
    (0, vitest_1.describe)("update", () => {
        (0, vitest_1.it)("should update device name", () => {
            const device = new domain_1.Device("123", "Old Name", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date());
            device.update({ name: "New Name" });
            (0, vitest_1.expect)(device.name).toBe("New Name");
            (0, vitest_1.expect)(device.mac).toBe("AA:BB:CC:DD:EE:FF"); // Should remain unchanged
        });
        (0, vitest_1.it)("should update device MAC address", () => {
            const device = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date());
            device.update({ mac: "11:22:33:44:55:66" });
            (0, vitest_1.expect)(device.mac).toBe("11:22:33:44:55:66");
            (0, vitest_1.expect)(device.name).toBe("Test Device"); // Should remain unchanged
        });
        (0, vitest_1.it)("should update both name and MAC address", () => {
            const device = new domain_1.Device("123", "Old Name", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date());
            device.update({
                name: "New Name",
                mac: "11:22:33:44:55:66",
            });
            (0, vitest_1.expect)(device.name).toBe("New Name");
            (0, vitest_1.expect)(device.mac).toBe("11:22:33:44:55:66");
        });
        (0, vitest_1.it)("should not update fields when undefined values are provided", () => {
            const device = new domain_1.Device("123", "Test Device", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date());
            device.update({ name: undefined, mac: undefined });
            (0, vitest_1.expect)(device.name).toBe("Test Device");
            (0, vitest_1.expect)(device.mac).toBe("AA:BB:CC:DD:EE:FF");
        });
        (0, vitest_1.it)("should update only provided fields", () => {
            const device = new domain_1.Device("123", "Old Name", "AA:BB:CC:DD:EE:FF", domain_1.DeviceStatus.ATIVO, new Date());
            device.update({ name: "New Name" });
            (0, vitest_1.expect)(device.name).toBe("New Name");
            (0, vitest_1.expect)(device.mac).toBe("AA:BB:CC:DD:EE:FF");
        });
    });
});
//# sourceMappingURL=Device.spec.js.map