export enum DeviceStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO'
}

export interface DeviceUpdateData {
  name?: string;
  mac?: string;
}

export class Device {
  constructor(
    public readonly id: string,
    public name: string,
    public mac: string,
    public status: DeviceStatus,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public toggleStatus(): void {
    this.status = this.status === DeviceStatus.ATIVO
      ? DeviceStatus.INATIVO
      : DeviceStatus.ATIVO;
  }

  public update(data: DeviceUpdateData): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.mac !== undefined) this.mac = data.mac;
  }
}
