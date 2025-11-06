export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface WeekDayUpdateData {
  dayName?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export class WeekDay {
  constructor(
    public readonly id: string,
    public dayName: string,
    public readonly dayOfWeek: DayOfWeek,
    public displayOrder: number,
    public isActive: boolean
  ) {}

  public toggleActive(): void {
    this.isActive = !this.isActive;
  }

  public update(data: WeekDayUpdateData): void {
    if (data.dayName !== undefined) this.dayName = data.dayName;
    if (data.displayOrder !== undefined) this.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) this.isActive = data.isActive;
  }
}
