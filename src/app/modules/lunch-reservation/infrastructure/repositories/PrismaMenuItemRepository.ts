// Note: If you see a TypeScript error here, run 'pnpm prisma generate' to generate the Prisma client
import { PrismaClient } from "@prisma/client"
import { MenuItem } from "../../domain/entities/MenuItem"
import { Category } from "../../domain/entities/Category"
import { MenuItemRepository } from "../../domain/repositories/MenuItemRepository"
import { CreateMenuItemDTO, UpdateMenuItemDTO } from "../../dtos/MenuItemDTOs"

export class PrismaMenuItemRepository implements MenuItemRepository {
  constructor(private prisma: PrismaClient) {}

  async findByCategory(categoryId: string): Promise<MenuItem[]> {
    const menuItems = await this.prisma.menuItem.findMany({
      where: { categoryId },
      include: { category: true },
      orderBy: { name: "asc" },
    })

    return menuItems.map(this.toDomain)
  }

  async findById(id: string): Promise<MenuItem | null> {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: true },
    })

    return menuItem ? this.toDomain(menuItem) : null
  }

  async findActive(): Promise<MenuItem[]> {
    const menuItems = await this.prisma.menuItem.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: "asc" },
    })

    return menuItems.map(this.toDomain)
  }

  async findActiveByCategoryId(categoryId: string): Promise<MenuItem[]> {
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      include: { category: true },
      orderBy: { name: "asc" },
    })

    return menuItems.map(this.toDomain)
  }

  async findAll(): Promise<MenuItem[]> {
    const menuItems = await this.prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    })

    return menuItems.map(this.toDomain)
  }

  async create(itemData: CreateMenuItemDTO): Promise<MenuItem> {
    const created = await this.prisma.menuItem.create({
      data: {
        name: itemData.name,
        description: itemData.description,
        categoryId: itemData.categoryId,
        isActive: itemData.isActive ?? true,
      },
      include: { category: true },
    })

    return this.toDomain(created)
  }

  async update(id: string, itemData: UpdateMenuItemDTO): Promise<MenuItem> {
    const updated = await this.prisma.menuItem.update({
      where: { id },
      data: {
        ...(itemData.name !== undefined && { name: itemData.name }),
        ...(itemData.description !== undefined && {
          description: itemData.description,
        }),
        ...(itemData.categoryId !== undefined && {
          categoryId: itemData.categoryId,
        }),
        ...(itemData.isActive !== undefined && { isActive: itemData.isActive }),
      },
      include: { category: true },
    })

    return this.toDomain(updated)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.menuItem.delete({
      where: { id },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(data: any): MenuItem {
    const category = data.category
      ? new Category(
          data.category.id,
          data.category.name,
          data.category.description,
          data.category.displayOrder,
          data.category.isActive,
          data.category.createdAt,
          data.category.updatedAt
        )
      : undefined

    return new MenuItem(
      data.id,
      data.name,
      data.description,
      data.categoryId,
      data.isActive,
      category,
      data.createdAt,
      data.updatedAt
    )
  }
}
