import { DayOfWeek } from './WeekDay';

export interface MenuUpdateData {
  observations?: string;
  isActive?: boolean;
}

export class Menu {
  constructor(
    public readonly id: string,
    public readonly date: Date,
    public readonly dayOfWeek: DayOfWeek,
    public readonly weekNumber: number,
    public observations: string,
    public isActive: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public toggleActive(): void {
    this.isActive = !this.isActive;
  }

  public update(data: MenuUpdateData): void {
    if (data.observations !== undefined) this.observations = data.observations;
    if (data.isActive !== undefined) this.isActive = data.isActive;
  }

  public static calculateWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  public static getDayOfWeek(date: Date): DayOfWeek {
    const dayIndex = date.getDay();
    const days = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY
    ];
    return days[dayIndex];
  }
}
