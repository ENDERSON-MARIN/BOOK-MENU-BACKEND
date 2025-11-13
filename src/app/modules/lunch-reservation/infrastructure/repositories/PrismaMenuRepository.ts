// Note: If you see a TypeScript error here, run 'pnpm prisma generate' to generate the Prisma client
import { PrismaClient } from "@prisma/client"
import { Menu } from "../../domain/entities/Menu"
import { DayOfWeek } from "../../domain/entities/WeekDay"
import { MenuComposition } from "../../domain/entities/MenuComposition"
import {
  MenuVariation,
  VariationType,
} from "../../domain/entities/MenuVariation"
import {
  MenuRepository,
  MenuWithDetails,
} from "../../domain/repositories/MenuRepository"
import { CreateMenuDTO, UpdateMenuDTO } from "../../dtos/MenuDTOs"

export class PrismaMenuRepository implements MenuRepository {
  constructor(private prisma: PrismaClient) {}

  async findByDate(date: Date): Promise<Menu | null> {
    // Normalize the date to midnight UTC to match database storage
    const normalizedDate = new Date(date)
    normalizedDate.setUTCHours(0, 0, 0, 0)

    const menu = await this.prisma.menu.findUnique({
      where: { date: normalizedDate },
    })

    return menu ? this.toDomain(menu) : null
  }

  async findByWeekNumber(weekNumber: number): Promise<Menu[]> {
    const menus = await this.prisma.menu.findMany({
      where: { weekNumber },
      orderBy: { date: "asc" },
    })

    return menus.map(this.toDomain)
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Menu[]> {
    const menus = await this.prisma.menu.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    })

    return menus.map(this.toDomain)
  }

  async findById(id: string): Promise<Menu | null> {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    })

    return menu ? this.toDomain(menu) : null
  }

  async findAll(): Promise<Menu[]> {
    const menus = await this.prisma.menu.findMany({
      orderBy: { date: "desc" },
    })

    return menus.map(this.toDomain)
  }

  async findActive(): Promise<Menu[]> {
    const menus = await this.prisma.menu.findMany({
      where: { isActive: true },
      orderBy: { date: "asc" },
    })

    return menus.map(this.toDomain)
  }

  async findWithComposition(menuId: string): Promise<MenuWithDetails | null> {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        menuCompositions: true,
        variations: true,
      },
    })

    if (!menu) return null

    const domainMenu = this.toDomain(menu)
    const menuCompositions = menu.menuCompositions.map(
      this.menuCompositionToDomain
    )
    const variations = menu.variations.map(this.menuVariationToDomain)

    return Object.assign(domainMenu, {
      menuCompositions,
      variations,
    }) as MenuWithDetails
  }

  async findWithCompositionByDate(date: Date): Promise<MenuWithDetails | null> {
    // Normalize the date to midnight UTC to match database storage
    const normalizedDate = new Date(date)
    normalizedDate.setUTCHours(0, 0, 0, 0)

    console.log(
      "🔍 Searching for menu with date:",
      normalizedDate.toISOString()
    )

    // Try to find all menus to debug
    const allMenus = await this.prisma.menu.findMany({
      select: {
        id: true,
        date: true,
      },
      take: 5,
    })
    console.log(
      "📅 Sample menus in database:",
      allMenus.map((m) => ({
        id: m.id,
        date: m.date.toISOString(),
      }))
    )

    // Try with findUnique first
    let menu = await this.prisma.menu.findUnique({
      where: { date: normalizedDate },
      include: {
        menuCompositions: true,
        variations: true,
      },
    })

    // If not found, try with date range (to handle potential timezone issues)
    if (!menu) {
      console.log(
        "⚠️ Menu not found with findUnique, trying with date range..."
      )

      const startOfDay = new Date(normalizedDate)
      startOfDay.setUTCHours(0, 0, 0, 0)

      const endOfDay = new Date(normalizedDate)
      endOfDay.setUTCHours(23, 59, 59, 999)

      const menus = await this.prisma.menu.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          menuCompositions: true,
          variations: true,
        },
      })

      menu = menus[0] || null
      console.log("🔄 Found with date range:", menu ? "YES" : "NO")
    }

    console.log("✅ Final result:", menu ? "FOUND" : "NOT FOUND")

    if (!menu) return null

    const domainMenu = this.toDomain(menu)
    const menuCompositions = menu.menuCompositions.map(
      this.menuCompositionToDomain
    )
    const variations = menu.variations.map(this.menuVariationToDomain)

    return Object.assign(domainMenu, {
      menuCompositions,
      variations,
    }) as MenuWithDetails
  }

  async create(menuData: CreateMenuDTO): Promise<Menu> {
    const dayOfWeek = Menu.getDayOfWeek(menuData.date)
    const weekNumber = Menu.calculateWeekNumber(menuData.date)

    const created = await this.prisma.menu.create({
      data: {
        date: menuData.date,
        dayOfWeek,
        weekNumber,
        observations: menuData.observations || "",
        isActive: menuData.isActive ?? true,
        menuCompositions: {
          create: menuData.menuItems.map((item) => ({
            menuItemId: item.menuItemId,
            observations: item.observations || "",
            isMainProtein: item.isMainProtein || false,
            isAlternativeProtein: item.isAlternativeProtein || false,
          })),
        },
      },
    })

    return this.toDomain(created)
  }

  async update(id: string, menuData: UpdateMenuDTO): Promise<Menu> {
    const updated = await this.prisma.menu.update({
      where: { id },
      data: {
        ...(menuData.observations !== undefined && {
          observations: menuData.observations,
        }),
        ...(menuData.isActive !== undefined && { isActive: menuData.isActive }),
      },
    })

    return this.toDomain(updated)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.menu.delete({
      where: { id },
    })
  }

  async createVariation(
    variationData: import("../../domain/repositories/MenuRepository").CreateMenuVariationDTO
  ): Promise<MenuVariation> {
    const created = await this.prisma.menuVariation.create({
      data: {
        menuId: variationData.menuId,
        variationType: variationData.variationType,
        proteinItemId: variationData.proteinItemId,
        isDefault: variationData.isDefault,
      },
    })

    return this.menuVariationToDomain(created)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(data: any): Menu {
    return new Menu(
      data.id,
      data.date,
      data.dayOfWeek as DayOfWeek,
      data.weekNumber,
      data.observations,
      data.isActive,
      data.createdAt,
      data.updatedAt
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private menuCompositionToDomain(data: any): MenuComposition {
    return new MenuComposition(
      data.id,
      data.menuId,
      data.menuItemId,
      data.observations,
      data.isMainProtein,
      data.isAlternativeProtein
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private menuVariationToDomain(data: any): MenuVariation {
    return new MenuVariation(
      data.id,
      data.menuId,
      data.variationType as VariationType,
      data.proteinItemId,
      data.isDefault
    )
  }
}
