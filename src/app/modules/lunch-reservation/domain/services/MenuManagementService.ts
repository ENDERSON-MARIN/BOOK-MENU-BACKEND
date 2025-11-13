import { Menu } from "../entities/Menu"
import { DayOfWeek } from "../entities/WeekDay"
import { VariationType } from "../entities/MenuVariation"
import { MenuRepository, MenuWithDetails } from "../repositories/MenuRepository"
import { MenuItemRepository } from "../repositories/MenuItemRepository"
import { WeekDayManagementService } from "./WeekDayManagementService"
import {
  CreateMenuDTO,
  UpdateMenuDTO,
  CreateMenuCompositionDTO,
} from "../../dtos/MenuDTOs"
import { AppError } from "@/app/shared"

export class MenuManagementService {
  constructor(
    private menuRepository: MenuRepository,
    private menuItemRepository: MenuItemRepository,
    private weekDayManagementService: WeekDayManagementService
  ) {}

  async create(menuData: CreateMenuDTO): Promise<Menu> {
    // Validate date is not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const menuDate = new Date(menuData.date)
    menuDate.setHours(0, 0, 0, 0)

    if (menuDate < today) {
      throw new AppError("Não é possível criar cardápio para data passada", 400)
    }

    // Check if menu already exists for this date
    const existingMenu = await this.menuRepository.findByDate(menuData.date)
    if (existingMenu) {
      throw new AppError("Já existe um cardápio para esta data", 409)
    }

    // Validate menu items exist and are active
    for (const composition of menuData.menuItems) {
      const menuItem = await this.menuItemRepository.findById(
        composition.menuItemId
      )
      if (!menuItem) {
        throw new AppError(
          `Item de menu com ID ${composition.menuItemId} não encontrado`,
          404
        )
      }
      if (!menuItem.isActive) {
        throw new AppError(`Item de menu "${menuItem.name}" está inativo`, 400)
      }
    }

    // Validate that there's at least one protein item
    const proteinItems = menuData.menuItems.filter(
      (item) => item.isMainProtein || item.isAlternativeProtein
    )
    if (proteinItems.length === 0) {
      throw new AppError(
        "Cardápio deve conter pelo menos um item de proteína",
        400
      )
    }

    // Create menu
    const createdMenu = await this.menuRepository.create(menuData)

    // Create automatic variations (standard and egg substitute)
    try {
      await this.createAutomaticVariations(createdMenu.id, menuData.menuItems)
    } catch (error) {
      // If variation creation fails, log but don't fail the menu creation
      console.error("Erro ao criar variações automáticas:", error)
      // Optionally, you could delete the menu here if variations are critical
      // await this.menuRepository.delete(createdMenu.id)
      // throw error
    }

    return createdMenu
  }

  async findAll(): Promise<Menu[]> {
    return await this.menuRepository.findAll()
  }

  async findActive(): Promise<Menu[]> {
    return await this.menuRepository.findActive()
  }

  async findById(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findById(id)
    if (!menu) {
      throw new AppError("Cardápio não encontrado", 404)
    }
    return menu
  }

  async findByDate(date: Date): Promise<Menu | null> {
    return await this.menuRepository.findByDate(date)
  }

  async findByWeekNumber(weekNumber: number): Promise<Menu[]> {
    return await this.menuRepository.findByWeekNumber(weekNumber)
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Menu[]> {
    return await this.menuRepository.findByDateRange(startDate, endDate)
  }

  async findWithComposition(menuId: string): Promise<MenuWithDetails> {
    const menu = await this.menuRepository.findWithComposition(menuId)
    if (!menu) {
      throw new AppError("Cardápio não encontrado", 404)
    }
    return menu
  }

  async findWithCompositionByDate(date: Date): Promise<MenuWithDetails | null> {
    return await this.menuRepository.findWithCompositionByDate(date)
  }

  async update(id: string, menuData: UpdateMenuDTO): Promise<Menu> {
    const existingMenu = await this.menuRepository.findById(id)
    if (!existingMenu) {
      throw new AppError("Cardápio não encontrado", 404)
    }

    // Validate date is not in the past (only if menu is being activated)
    if (menuData.isActive === true) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const menuDate = new Date(existingMenu.date)
      menuDate.setHours(0, 0, 0, 0)

      if (menuDate < today) {
        throw new AppError(
          "Não é possível ativar cardápio para data passada",
          400
        )
      }
    }

    const updatedMenu = await this.menuRepository.update(id, menuData)
    return updatedMenu
  }

  async delete(id: string): Promise<void> {
    const existingMenu = await this.menuRepository.findById(id)
    if (!existingMenu) {
      throw new AppError("Cardápio não encontrado", 404)
    }

    // Check if menu has reservations
    // This would require ReservationRepository, but for now we'll allow deletion
    // In a real implementation, we might want to check for dependencies

    await this.menuRepository.delete(id)
  }

  async toggleActive(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findById(id)
    if (!menu) {
      throw new AppError("Cardápio não encontrado", 404)
    }

    // If activating, validate date is not in the past
    if (!menu.isActive) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const menuDate = new Date(menu.date)
      menuDate.setHours(0, 0, 0, 0)

      if (menuDate < today) {
        throw new AppError(
          "Não é possível ativar cardápio para data passada",
          400
        )
      }
    }

    // Toggle active status using entity method
    menu.toggleActive()

    // Update in repository
    const updatedMenu = await this.menuRepository.update(id, {
      isActive: menu.isActive,
    })

    return updatedMenu
  }

  async getAvailableMenus(
    startDate?: Date,
    endDate?: Date
  ): Promise<MenuWithDetails[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const searchStartDate = startDate || today
    const searchEndDate =
      endDate || new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from today

    const menus = await this.menuRepository.findByDateRange(
      searchStartDate,
      searchEndDate
    )
    const availableMenus: MenuWithDetails[] = []

    for (const menu of menus) {
      if (menu.isActive) {
        const menuWithDetails = await this.menuRepository.findWithComposition(
          menu.id
        )
        if (menuWithDetails) {
          availableMenus.push(menuWithDetails)
        }
      }
    }

    return availableMenus.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  async getMenusForWeek(
    weekNumber: number,
    year?: number
  ): Promise<MenuWithDetails[]> {
    const targetYear = year || new Date().getFullYear()
    const weekDates = this.weekDayManagementService.getBusinessDatesForWeek(
      weekNumber,
      targetYear
    )

    const menus: MenuWithDetails[] = []

    for (const date of weekDates) {
      const menu = await this.menuRepository.findWithCompositionByDate(date)
      if (menu && menu.isActive) {
        menus.push(menu)
      }
    }

    return menus.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  async createWeeklyMenus(
    weekNumber: number,
    year: number,
    menuTemplates: { [key in DayOfWeek]?: CreateMenuCompositionDTO[] }
  ): Promise<Menu[]> {
    const businessDates = this.weekDayManagementService.getBusinessDatesForWeek(
      weekNumber,
      year
    )
    const createdMenus: Menu[] = []

    for (const date of businessDates) {
      const dayOfWeek = this.weekDayManagementService.convertJsDayToDayOfWeek(
        date.getDay()
      )
      const menuItems = menuTemplates[dayOfWeek]

      if (menuItems && menuItems.length > 0) {
        // Check if menu already exists for this date
        const existingMenu = await this.menuRepository.findByDate(date)
        if (!existingMenu) {
          const menuData: CreateMenuDTO = {
            date,
            observations: `Cardápio da semana ${weekNumber}`,
            isActive: true,
            menuItems,
          }

          const createdMenu = await this.create(menuData)
          createdMenus.push(createdMenu)
        }
      }
    }

    return createdMenus
  }

  private async createAutomaticVariations(
    menuId: string,
    menuCompositions: CreateMenuCompositionDTO[]
  ): Promise<void> {
    // Find the main protein item
    const mainProteinComposition = menuCompositions.find(
      (comp) => comp.isMainProtein
    )

    if (!mainProteinComposition) {
      throw new AppError(
        "Não foi possível encontrar proteína principal para criar variações",
        400
      )
    }

    // Create STANDARD variation with main protein
    await this.menuRepository.createVariation({
      menuId,
      variationType: VariationType.STANDARD,
      proteinItemId: mainProteinComposition.menuItemId,
      isDefault: true,
    })

    // Find egg substitute item (assuming there's a standard egg item)
    const allMenuItems = await this.menuItemRepository.findActive()
    const eggItem = allMenuItems.find(
      (item) =>
        item.name.toLowerCase().includes("ovo") ||
        item.name.toLowerCase().includes("egg")
    )

    if (eggItem) {
      // Create EGG_SUBSTITUTE variation
      await this.menuRepository.createVariation({
        menuId,
        variationType: VariationType.EGG_SUBSTITUTE,
        proteinItemId: eggItem.id,
        isDefault: false,
      })
    }
  }

  async duplicateMenu(sourceMenuId: string, targetDate: Date): Promise<Menu> {
    // Validate source menu exists
    const sourceMenu =
      await this.menuRepository.findWithComposition(sourceMenuId)
    if (!sourceMenu) {
      throw new AppError("Cardápio origem não encontrado", 404)
    }

    // Validate target date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const menuDate = new Date(targetDate)
    menuDate.setHours(0, 0, 0, 0)

    if (menuDate < today) {
      throw new AppError(
        "Não é possível duplicar cardápio para data passada",
        400
      )
    }

    // Check if menu already exists for target date
    const existingMenu = await this.menuRepository.findByDate(targetDate)
    if (existingMenu) {
      throw new AppError("Já existe um cardápio para a data de destino", 409)
    }

    // Create new menu data based on source menu
    const newMenuData: CreateMenuDTO = {
      date: targetDate,
      observations: `Duplicado de ${sourceMenu.date.toLocaleDateString()}`,
      isActive: true,
      menuItems: sourceMenu.menuCompositions.map((comp) => ({
        menuItemId: comp.menuItemId,
        observations: comp.observations,
        isMainProtein: comp.isMainProtein,
        isAlternativeProtein: comp.isAlternativeProtein,
      })),
    }

    return await this.create(newMenuData)
  }
}
