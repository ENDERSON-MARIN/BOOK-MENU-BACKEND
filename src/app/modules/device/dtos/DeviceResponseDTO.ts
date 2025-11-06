import { DeviceStatus } from '../domain/Device'

export interface DeviceResponseDTO {
  id: string
  name: string
  mac: string
  status: DeviceStatus
  createdAt: Date
}
