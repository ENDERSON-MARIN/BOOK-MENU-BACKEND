export interface MenuItemUpdateData {
  name?: string;
  description?: string;
  categoryId?: string;
  isActive?: boolean;
}

export class MenuItem {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public categoryId: string,
    public isActive: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public toggleActive(): void {
    this.isActive = !this.isActive;
  }

  public update(data: MenuItemUpdateData): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.categoryId !== undefined) this.categoryId = data.categoryId;
    if (data.isActive !== undefined) this.isActive = data.isActive;
  }
}
