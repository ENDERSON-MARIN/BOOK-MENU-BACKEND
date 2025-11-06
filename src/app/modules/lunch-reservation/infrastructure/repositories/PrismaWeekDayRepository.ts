// Note: If you see a TypeScript error here, run 'pnpm prisma generate' to generate the Prisma client
import { PrismaClient } from "@prisma/client"
import { WeekDay, DayOfWeek } from "../../domain/entities/WeekDay"
import { WeekDayRepository } from "../../domain/repositories/WeekDayRepository"

export class PrismaWeekDayRepository implements WeekDayRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<WeekDay[]> {
    const weekDays = await this.prisma.weekDay.findMany({
      orderBy: { displayOrder: "asc" },
    })

    return weekDays.map(this.toDomain)
  }

  async findByDayOfWeek(dayOfWeek: DayOfWeek): Promise<WeekDay | null> {
    const weekDay = await this.prisma.weekDay.findUnique({
      where: { dayOfWeek },
    })

    return weekDay ? this.toDomain(weekDay) : null
  }

  async findActive(): Promise<WeekDay[]> {
    const weekDays = await this.prisma.weekDay.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    })

    return weekDays.map(this.toDomain)
  }

  async findById(id: string): Promise<WeekDay | null> {
    const weekDay = await this.prisma.weekDay.findUnique({
      where: { id },
    })

    return weekDay ? this.toDomain(weekDay) : null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(data: any): WeekDay {
    return new WeekDay(
      data.id,
      data.dayName,
      data.dayOfWeek as DayOfWeek,
      data.displayOrder,
      data.isActive
    )
  }
}
