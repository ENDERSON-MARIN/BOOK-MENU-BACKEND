import { Category } from "../entities/Category"
import { CategoryRepository } from "../repositories/CategoryRepository"
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../dtos/CategoryDTOs"
import { AppError } from "@/app/shared"

export class CategoryManagementService {
  constructor(private categoryRepository: CategoryRepository) {}

  async create(categoryData: CreateCategoryDTO): Promise<Category> {
    // Validate name uniqueness
    const existingCategories = await this.categoryRepository.findAll()
    const nameExists = existingCategories.some(
      (category) =>
        category.name.toLowerCase() === categoryData.name.toLowerCase()
    )

    if (nameExists) {
      throw new AppError("Categoria com este nome já existe", 409)
    }

    // If displayOrder is not provided, set it as the next available order
    let displayOrder = categoryData.displayOrder
    if (displayOrder === undefined) {
      const maxOrder = existingCategories.reduce(
        (max, category) => Math.max(max, category.displayOrder),
        0
      )
      displayOrder = maxOrder + 1
    }

    const categoryDataWithOrder: CreateCategoryDTO = {
      ...categoryData,
      displayOrder,
    }

    const createdCategory = await this.categoryRepository.create(
      categoryDataWithOrder
    )
    return createdCategory
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.findAll()
  }

  async findActive(): Promise<Category[]> {
    return await this.categoryRepository.findActive()
  }

  async findByDisplayOrder(): Promise<Category[]> {
    return await this.categoryRepository.findByDisplayOrder()
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id)
    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }
    return category
  }

  async update(id: string, categoryData: UpdateCategoryDTO): Promise<Category> {
    const existingCategory = await this.categoryRepository.findById(id)
    if (!existingCategory) {
      throw new AppError("Categoria não encontrada", 404)
    }

    // Validate name uniqueness if name is being updated
    if (categoryData.name) {
      const allCategories = await this.categoryRepository.findAll()
      const nameExists = allCategories.some(
        (category) =>
          category.id !== id &&
          category.name.toLowerCase() === categoryData.name!.toLowerCase()
      )

      if (nameExists) {
        throw new AppError("Categoria com este nome já existe", 409)
      }
    }

    const updatedCategory = await this.categoryRepository.update(
      id,
      categoryData
    )
    return updatedCategory
  }

  async delete(id: string): Promise<void> {
    const existingCategory = await this.categoryRepository.findById(id)
    if (!existingCategory) {
      throw new AppError("Categoria não encontrada", 404)
    }

    // Check if category has associated menu items
    // This would require MenuItemRepository, but for now we'll allow deletion
    // In a real implementation, we might want to check for dependencies

    await this.categoryRepository.delete(id)
  }

  async toggleActive(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id)
    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }

    // Toggle active status using entity method
    category.toggleActive()

    // Update in repository
    const updatedCategory = await this.categoryRepository.update(id, {
      isActive: category.isActive,
    })

    return updatedCategory
  }

  async reorderCategories(
    categoryOrders: { id: string; displayOrder: number }[]
  ): Promise<Category[]> {
    const updatedCategories: Category[] = []

    for (const { id, displayOrder } of categoryOrders) {
      const category = await this.categoryRepository.findById(id)
      if (!category) {
        throw new AppError(`Categoria com ID ${id} não encontrada`, 404)
      }

      const updatedCategory = await this.categoryRepository.update(id, {
        displayOrder,
      })
      updatedCategories.push(updatedCategory)
    }

    return updatedCategories
  }

  async getNextDisplayOrder(): Promise<number> {
    const categories = await this.categoryRepository.findAll()
    const maxOrder = categories.reduce(
      (max, category) => Math.max(max, category.displayOrder),
      0
    )
    return maxOrder + 1
  }

  async moveUp(id: string): Promise<Category[]> {
    const category = await this.categoryRepository.findById(id)
    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }

    const allCategories = await this.categoryRepository.findByDisplayOrder()
    const currentIndex = allCategories.findIndex((c) => c.id === id)

    if (currentIndex <= 0) {
      throw new AppError("Categoria já está na primeira posição", 400)
    }

    // Swap display orders
    const previousCategory = allCategories[currentIndex - 1]
    const currentOrder = category.displayOrder
    const previousOrder = previousCategory.displayOrder

    await this.categoryRepository.update(category.id, {
      displayOrder: previousOrder,
    })
    await this.categoryRepository.update(previousCategory.id, {
      displayOrder: currentOrder,
    })

    return await this.categoryRepository.findByDisplayOrder()
  }

  async moveDown(id: string): Promise<Category[]> {
    const category = await this.categoryRepository.findById(id)
    if (!category) {
      throw new AppError("Categoria não encontrada", 404)
    }

    const allCategories = await this.categoryRepository.findByDisplayOrder()
    const currentIndex = allCategories.findIndex((c) => c.id === id)

    if (currentIndex >= allCategories.length - 1) {
      throw new AppError("Categoria já está na última posição", 400)
    }

    // Swap display orders
    const nextCategory = allCategories[currentIndex + 1]
    const currentOrder = category.displayOrder
    const nextOrder = nextCategory.displayOrder

    await this.categoryRepository.update(category.id, {
      displayOrder: nextOrder,
    })
    await this.categoryRepository.update(nextCategory.id, {
      displayOrder: currentOrder,
    })

    return await this.categoryRepository.findByDisplayOrder()
  }
}
