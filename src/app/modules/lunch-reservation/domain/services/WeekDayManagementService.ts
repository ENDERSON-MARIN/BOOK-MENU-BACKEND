import { WeekDay, DayOfWeek } from "../entities/WeekDay"
import { WeekDayRepository } from "../repositories/WeekDayRepository"
import { AppError } from "@/app/shared"

export interface WeekInfo {
  weekNumber: number
  year: number
  startDate: Date
  endDate: Date
}

export class WeekDayManagementService {
  constructor(private weekDayRepository: WeekDayRepository) {}

  async findAll(): Promise<WeekDay[]> {
    return await this.weekDayRepository.findAll()
  }

  async findActive(): Promise<WeekDay[]> {
    return await this.weekDayRepository.findActive()
  }

  async findById(id: string): Promise<WeekDay> {
    const weekDay = await this.weekDayRepository.findById(id)
    if (!weekDay) {
      throw new AppError("Dia da semana não encontrado", 404)
    }
    return weekDay
  }

  async findByDayOfWeek(dayOfWeek: DayOfWeek): Promise<WeekDay> {
    const weekDay = await this.weekDayRepository.findByDayOfWeek(dayOfWeek)
    if (!weekDay) {
      throw new AppError("Dia da semana não encontrado", 404)
    }
    return weekDay
  }

  /**
   * Get business days (Monday to Friday) only
   */
  async getBusinessDays(): Promise<WeekDay[]> {
    const allDays = await this.weekDayRepository.findActive()
    return allDays.filter(
      (day) =>
        day.dayOfWeek !== DayOfWeek.SATURDAY &&
        day.dayOfWeek !== DayOfWeek.SUNDAY
    )
  }

  /**
   * Get weekend days (Saturday and Sunday) only
   */
  async getWeekendDays(): Promise<WeekDay[]> {
    const allDays = await this.weekDayRepository.findActive()
    return allDays.filter(
      (day) =>
        day.dayOfWeek === DayOfWeek.SATURDAY ||
        day.dayOfWeek === DayOfWeek.SUNDAY
    )
  }

  /**
   * Calculate week number based on date
   * Uses ISO 8601 week numbering
   */
  calculateWeekNumber(date: Date): number {
    const tempDate = new Date(date.getTime())
    tempDate.setHours(0, 0, 0, 0)

    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7))

    // Get first day of year
    const yearStart = new Date(tempDate.getFullYear(), 0, 1)

    // Calculate full weeks to nearest Thursday
    const weekNumber = Math.ceil(
      ((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    )

    return weekNumber
  }

  /**
   * Get week information for a given date
   */
  getWeekInfo(date: Date): WeekInfo {
    const weekNumber = this.calculateWeekNumber(date)
    const year = date.getFullYear()

    // Calculate start and end dates of the week
    const startDate = this.getWeekStartDate(date)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)

    return {
      weekNumber,
      year,
      startDate,
      endDate,
    }
  }

  /**
   * Get the start date (Monday) of the week for a given date
   */
  getWeekStartDate(date: Date): Date {
    const tempDate = new Date(date)
    const day = tempDate.getDay()
    const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(tempDate.setDate(diff))
  }

  /**
   * Get the end date (Sunday) of the week for a given date
   */
  getWeekEndDate(date: Date): Date {
    const startDate = this.getWeekStartDate(date)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    return endDate
  }

  /**
   * Get all dates for a specific week
   */
  getWeekDates(weekNumber: number, year: number): Date[] {
    // Get January 4th of the year (always in week 1)
    const jan4 = new Date(year, 0, 4)

    // Calculate the Monday of week 1
    const week1Monday = new Date(jan4)
    week1Monday.setDate(jan4.getDate() - jan4.getDay() + 1)

    // Calculate the Monday of the target week
    const targetWeekMonday = new Date(week1Monday)
    targetWeekMonday.setDate(week1Monday.getDate() + (weekNumber - 1) * 7)

    // Generate all 7 days of the week
    const weekDates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(targetWeekMonday)
      date.setDate(targetWeekMonday.getDate() + i)
      weekDates.push(date)
    }

    return weekDates
  }

  /**
   * Get business dates for a specific week (Monday to Friday)
   */
  getBusinessDatesForWeek(weekNumber: number, year: number): Date[] {
    const weekDates = this.getWeekDates(weekNumber, year)
    // Return only Monday to Friday (indices 0-4)
    return weekDates.slice(0, 5)
  }

  /**
   * Convert JavaScript day number to DayOfWeek enum
   */
  convertJsDayToDayOfWeek(jsDay: number): DayOfWeek {
    const dayMap = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    }

    return dayMap[jsDay as keyof typeof dayMap]
  }

  /**
   * Convert DayOfWeek enum to JavaScript day number
   */
  convertDayOfWeekToJsDay(dayOfWeek: DayOfWeek): number {
    const dayMap = {
      [DayOfWeek.SUNDAY]: 0,
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6,
    }

    return dayMap[dayOfWeek]
  }

  /**
   * Check if a date is a business day (Monday to Friday)
   */
  isBusinessDay(date: Date): boolean {
    const dayOfWeek = this.convertJsDayToDayOfWeek(date.getDay())
    return dayOfWeek !== DayOfWeek.SATURDAY && dayOfWeek !== DayOfWeek.SUNDAY
  }

  /**
   * Check if a date is a weekend day (Saturday or Sunday)
   */
  isWeekendDay(date: Date): boolean {
    const dayOfWeek = this.convertJsDayToDayOfWeek(date.getDay())
    return dayOfWeek === DayOfWeek.SATURDAY || dayOfWeek === DayOfWeek.SUNDAY
  }

  /**
   * Get the next business day from a given date
   */
  getNextBusinessDay(date: Date): Date {
    const nextDay = new Date(date)
    nextDay.setDate(date.getDate() + 1)

    while (!this.isBusinessDay(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1)
    }

    return nextDay
  }

  /**
   * Get the previous business day from a given date
   */
  getPreviousBusinessDay(date: Date): Date {
    const previousDay = new Date(date)
    previousDay.setDate(date.getDate() - 1)

    while (!this.isBusinessDay(previousDay)) {
      previousDay.setDate(previousDay.getDate() - 1)
    }

    return previousDay
  }

  /**
   * Get all business days in a date range
   */
  getBusinessDaysInRange(startDate: Date, endDate: Date): Date[] {
    const businessDays: Date[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      if (this.isBusinessDay(currentDate)) {
        businessDays.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return businessDays
  }
}
