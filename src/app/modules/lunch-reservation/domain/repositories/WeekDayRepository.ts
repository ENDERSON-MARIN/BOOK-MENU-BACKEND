import { WeekDay, DayOfWeek } from '../entities/WeekDay';

export interface WeekDayRepository {
  findAll(): Promise<WeekDay[]>;
  findByDayOfWeek(dayOfWeek: DayOfWeek): Promise<WeekDay | null>;
  findActive(): Promise<WeekDay[]>;
  findById(id: string): Promise<WeekDay | null>;
}
