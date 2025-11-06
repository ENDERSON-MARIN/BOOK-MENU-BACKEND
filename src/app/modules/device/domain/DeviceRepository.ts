import { Device } from "./Device";

export interface DeviceRepository {
  create(device: Device): Promise<Device>;
  findAll(): Promise<Device[]>;
  findById(id: string): Promise<Device | null>;
  findByMac(mac: string): Promise<Device | null>;
  update(id: string, device: Device): Promise<Device>;
  delete(id: string): Promise<void>;
}
