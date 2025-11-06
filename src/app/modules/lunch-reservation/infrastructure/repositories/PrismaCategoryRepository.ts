// Note: If you see a TypeScript error here, run 'pnpm prisma generate' to generate the Prisma client
import { PrismaClient } from "@prisma/client"
import { Category } from "../../domain/entities/Category"
import { CategoryRepository } from "../../domain/repositories/CategoryRepository"
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../dtos/CategoryDTOs"

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
    })

    return categories.map(this.toDomain)
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    })

    return category ? this.toDomain(category) : null
  }

  async findActive(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    })

    return categories.map(this.toDomain)
  }

  async findByDisplayOrder(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
    })

    return categories.map(this.toDomain)
  }

  async create(categoryData: CreateCategoryDTO): Promise<Category> {
    const created = await this.prisma.category.create({
      data: {
        name: categoryData.name,
        description: categoryData.description,
        displayOrder: categoryData.displayOrder,
        isActive: categoryData.isActive ?? true,
      },
    })

    return this.toDomain(created)
  }

  async update(id: string, categoryData: UpdateCategoryDTO): Promise<Category> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(categoryData.name !== undefined && { name: categoryData.name }),
        ...(categoryData.description !== undefined && { description: categoryData.description }),
        ...(categoryData.displayOrder !== undefined && { displayOrder: categoryData.displayOrder }),
        ...(categoryData.isActive !== undefined && { isActive: categoryData.isActive }),
      },
    })

    return this.toDomain(updated)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(data: any): Category {
    return new Category(
      data.id,
      data.name,
      data.description,
      data.displayOrder,
      data.isActive,
      data.createdAt,
      data.updatedAt
    )
  }
}
