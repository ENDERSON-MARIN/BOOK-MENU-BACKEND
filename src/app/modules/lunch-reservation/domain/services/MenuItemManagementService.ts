import { MenuItem } from "../entities/MenuItem"
import { MenuItemRepository } from "../repositories/MenuItemRepository"
import { CategoryRepository } from "../repositories/CategoryRepository"
import { CreateMenuItemDTO, UpdateMenuItemDTO } from "../../dtos/MenuItemDTOs"
import { AppError } from "@/app/shared"

export class MenuItemManagementService {
  constructor(
    private menuItemRepository: MenuItemRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async create(itemData: CreateMenuItemDTO): Promise<MenuItem> {
    // Validate category exists
    const category = await this.categoryRepository.findById(itemData.categoryId)
    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }

    // Validate category is active
    if (!category.isActive) {
      throw new AppError("Não é possível criar item em categoria inativa", 400)
    }

    // Validate name uniqueness within category
    const existingItems = await this.menuItemRepository.findByCategory(
      itemData.categoryId
    )
    const nameExists = existingItems.some(
      (item) => item.name.toLowerCase() === itemData.name.toLowerCase()
    )

    if (nameExists) {
      throw new AppError("Item com este nome já existe nesta categoria", 409)
    }

    const createdItem = await this.menuItemRepository.create(itemData)
    return createdItem
  }

  async findAll(): Promise<MenuItem[]> {
    return await this.menuItemRepository.findAll()
  }

  async findActive(): Promise<MenuItem[]> {
    return await this.menuItemRepository.findActive()
  }

  async findByCategory(categoryId: string): Promise<MenuItem[]> {
    // Validate category exists
    const category = await this.categoryRepository.findById(categoryId)
    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }

    return await this.menuItemRepository.findByCategory(categoryId)
  }

  async findActiveByCategoryId(categoryId: string): Promise<MenuItem[]> {
    // Validate category exists
    const category = await this.categoryRepository.findById(categoryId)
    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }

    return await this.menuItemRepository.findActiveByCategoryId(categoryId)
  }

  async findById(id: string): Promise<MenuItem> {
    const item = await this.menuItemRepository.findById(id)
    if (!item) {
      throw new AppError("Item de menu não encontrado", 404)
    }
    return item
  }

  async update(id: string, itemData: UpdateMenuItemDTO): Promise<MenuItem> {
    const existingItem = await this.menuItemRepository.findById(id)
    if (!existingItem) {
      throw new AppError("Item de menu não encontrado", 404)
    }

    // If category is being changed, validate new category
    if (
      itemData.categoryId &&
      itemData.categoryId !== existingItem.categoryId
    ) {
      const newCategory = await this.categoryRepository.findById(
        itemData.categoryId
      )
      if (!newCategory) {
        throw new AppError("Nova categoria não encontrada", 404)
      }

      if (!newCategory.isActive) {
        throw new AppError(
          "Não é possível mover item para categoria inativa",
          400
        )
      }
    }

    // Validate name uniqueness within category if name is being updated
    if (itemData.name) {
      const categoryId = itemData.categoryId || existingItem.categoryId
      const categoryItems =
        await this.menuItemRepository.findByCategory(categoryId)
      const nameExists = categoryItems.some(
        (item) =>
          item.id !== id &&
          item.name.toLowerCase() === itemData.name!.toLowerCase()
      )

      if (nameExists) {
        throw new AppError("Item com este nome já existe nesta categoria", 409)
      }
    }

    const updatedItem = await this.menuItemRepository.update(id, itemData)
    return updatedItem
  }

  async delete(id: string): Promise<void> {
    const existingItem = await this.menuItemRepository.findById(id)
    if (!existingItem) {
      throw new AppError("Item de menu não encontrado", 404)
    }

    // Check if item is being used in any menu compositions
    // This would require MenuRepository, but for now we'll allow deletion
    // In a real implementation, we might want to check for dependencies

    await this.menuItemRepository.delete(id)
  }

  async toggleActive(id: string): Promise<MenuItem> {
    const item = await this.menuItemRepository.findById(id)
    if (!item) {
      throw new AppError("Item de menu não encontrado", 404)
    }

    // Toggle active status using entity method
    item.toggleActive()

    // Update in repository
    const updatedItem = await this.menuItemRepository.update(id, {
      isActive: item.isActive,
    })

    return updatedItem
  }

  async moveToCategory(id: string, newCategoryId: string): Promise<MenuItem> {
    const item = await this.menuItemRepository.findById(id)
    if (!item) {
      throw new AppError("Item de menu não encontrado", 404)
    }

    // Validate new category
    const newCategory = await this.categoryRepository.findById(newCategoryId)
    if (!newCategory) {
      throw new AppError("Nova categoria não encontrada", 404)
    }

    if (!newCategory.isActive) {
      throw new AppError(
        "Não é possível mover item para categoria inativa",
        400
      )
    }

    // Check if item name already exists in new category
    const newCategoryItems =
      await this.menuItemRepository.findByCategory(newCategoryId)
    const nameExists = newCategoryItems.some(
      (existingItem) =>
        existingItem.name.toLowerCase() === item.name.toLowerCase()
    )

    if (nameExists) {
      throw new AppError(
        "Item com este nome já existe na categoria de destino",
        409
      )
    }

    // Update category
    const updatedItem = await this.menuItemRepository.update(id, {
      categoryId: newCategoryId,
    })

    return updatedItem
  }

  async searchByName(searchTerm: string): Promise<MenuItem[]> {
    const allItems = await this.menuItemRepository.findAll()
    const searchTermLower = searchTerm.toLowerCase()

    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTermLower) ||
        item.description.toLowerCase().includes(searchTermLower)
    )
  }

  async searchActiveByName(searchTerm: string): Promise<MenuItem[]> {
    const activeItems = await this.menuItemRepository.findActive()
    const searchTermLower = searchTerm.toLowerCase()

    return activeItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTermLower) ||
        item.description.toLowerCase().includes(searchTermLower)
    )
  }

  async getItemsByMultipleCategories(
    categoryIds: string[]
  ): Promise<MenuItem[]> {
    const items: MenuItem[] = []

    for (const categoryId of categoryIds) {
      const categoryItems =
        await this.menuItemRepository.findActiveByCategoryId(categoryId)
      items.push(...categoryItems)
    }

    return items
  }

  async bulkToggleActive(
    itemIds: string[],
    isActive: boolean
  ): Promise<MenuItem[]> {
    const updatedItems: MenuItem[] = []

    for (const itemId of itemIds) {
      const item = await this.menuItemRepository.findById(itemId)
      if (!item) {
        throw new AppError(`Item com ID ${itemId} não encontrado`, 404)
      }

      const updatedItem = await this.menuItemRepository.update(itemId, {
        isActive,
      })
      updatedItems.push(updatedItem)
    }

    return updatedItems
  }
}
