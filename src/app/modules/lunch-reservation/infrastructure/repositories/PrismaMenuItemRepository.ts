// Note: If you see a TypeScript error here, run 'pnpm prisma generate' to generate the Prisma client
import { PrismaClient } from "@prisma/client"
import { MenuItem } from "../../domain/entities/MenuItem"
import { MenuItemRepository } from "../../domain/repositories/MenuItemRepository"
import { CreateMenuItemDTO, UpdateMenuItemDTO } from "../../dtos/MenuItemDTOs"

export class PrismaMenuItemRepository implements MenuItemRepository {
  constructor(private prisma: PrismaClient) {}

  async findByCategory(categoryId: string): Promise<MenuItem[]> {
    const menuItems = await this.prisma.menuItem.findMany({
      where: { categoryId },
      orderBy: { name: "asc" },
    })

    return menuItems.map(this.toDomain)
  }

  async findById(id: string): Promise<MenuItem | null> {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
    })

    return menuItem ? this.toDomain(menuItem) : null
  }

  async findActive(): Promise<MenuItem[]> {
    const menuItems = await this.prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    })

    return menuItems.map(this.toDomain)
  }

  async findActiveByCategoryId(categoryId: string): Promise<MenuItem[]> {
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        categoryId,
        isActive: true
      },
      orderBy: { name: "asc" },
    })

    return menuItems.map(this.toDomain)
  }

  async findAll(): Promise<MenuItem[]> {
    const menuItems = await this.prisma.menuItem.findMany({
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
    })

    return this.toDomain(created)
  }

  async update(id: string, itemData: UpdateMenuItemDTO): Promise<MenuItem> {
    const updated = await this.prisma.menuItem.update({
      where: { id },
      data: {
        ...(itemData.name !== undefined && { name: itemData.name }),
        ...(itemData.description !== undefined && { description: itemData.description }),
        ...(itemData.categoryId !== undefined && { categoryId: itemData.categoryId }),
        ...(itemData.isActive !== undefined && { isActive: itemData.isActive }),
      },
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
    return new MenuItem(
      data.id,
      data.name,
      data.description,
      data.categoryId,
      data.isActive,
      data.createdAt,
      data.updatedAt
    )
  }
}
