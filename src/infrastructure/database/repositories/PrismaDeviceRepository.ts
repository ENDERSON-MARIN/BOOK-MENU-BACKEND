// Note: If you see a TypeScript error here, run 'pnpm prisma generate' to generate the Prisma client
import { PrismaClient } from "@prisma/client"
import { Device, DeviceRepository, DeviceStatus } from "@/app/modules/device"

export class PrismaDeviceRepository implements DeviceRepository {
  constructor(private prisma: PrismaClient) {}

  async create(device: Device): Promise<Device> {
    const created = await this.prisma.device.create({
      data: {
        name: device.name,
        mac: device.mac,
        status: device.status,
      },
    })

    return this.toDomain(created)
  }

  async findAll(): Promise<Device[]> {
    const devices = await this.prisma.device.findMany({
      orderBy: { createdAt: "desc" },
    })

    return devices.map(this.toDomain)
  }

  async findById(id: string): Promise<Device | null> {
    const device = await this.prisma.device.findUnique({
      where: { id },
    })

    return device ? this.toDomain(device) : null
  }

  async findByMac(mac: string): Promise<Device | null> {
    const device = await this.prisma.device.findUnique({
      where: { mac },
    })

    return device ? this.toDomain(device) : null
  }

  async update(id: string, device: Device): Promise<Device> {
    const updated = await this.prisma.device.update({
      where: { id },
      data: {
        name: device.name,
        mac: device.mac,
        status: device.status,
      },
    })

    return this.toDomain(updated)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.device.delete({
      where: { id },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(data: any): Device {
    return new Device(
      data.id,
      data.name,
      data.mac,
      data.status as DeviceStatus,
      data.createdAt,
      data.updatedAt
    )
  }
}
