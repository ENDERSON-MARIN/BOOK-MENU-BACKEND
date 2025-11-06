import { describe, it, expect } from "vitest"
import { Device, DeviceStatus } from "@/app/modules/device/domain"

describe("Device", () => {
  describe("toggleStatus", () => {
    it("should toggle status from ATIVO to INATIVO", () => {
      const device = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.ATIVO,
        new Date()
      )

      device.toggleStatus()

      expect(device.status).toBe(DeviceStatus.INATIVO)
    })

    it("should toggle status from INATIVO to ATIVO", () => {
      const device = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.INATIVO,
        new Date()
      )

      device.toggleStatus()

      expect(device.status).toBe(DeviceStatus.ATIVO)
    })
  })

  describe("update", () => {
    it("should update device name", () => {
      const device = new Device(
        "123",
        "Old Name",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.ATIVO,
        new Date()
      )

      device.update({ name: "New Name" })

      expect(device.name).toBe("New Name")
      expect(device.mac).toBe("AA:BB:CC:DD:EE:FF") // Should remain unchanged
    })

    it("should update device MAC address", () => {
      const device = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.ATIVO,
        new Date()
      )

      device.update({ mac: "11:22:33:44:55:66" })

      expect(device.mac).toBe("11:22:33:44:55:66")
      expect(device.name).toBe("Test Device") // Should remain unchanged
    })

    it("should update both name and MAC address", () => {
      const device = new Device(
        "123",
        "Old Name",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.ATIVO,
        new Date()
      )

      device.update({
        name: "New Name",
        mac: "11:22:33:44:55:66",
      })

      expect(device.name).toBe("New Name")
      expect(device.mac).toBe("11:22:33:44:55:66")
    })

    it("should not update fields when undefined values are provided", () => {
      const device = new Device(
        "123",
        "Test Device",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.ATIVO,
        new Date()
      )

      device.update({ name: undefined, mac: undefined })

      expect(device.name).toBe("Test Device")
      expect(device.mac).toBe("AA:BB:CC:DD:EE:FF")
    })

    it("should update only provided fields", () => {
      const device = new Device(
        "123",
        "Old Name",
        "AA:BB:CC:DD:EE:FF",
        DeviceStatus.ATIVO,
        new Date()
      )

      device.update({ name: "New Name" })

      expect(device.name).toBe("New Name")
      expect(device.mac).toBe("AA:BB:CC:DD:EE:FF")
    })
  })
})
