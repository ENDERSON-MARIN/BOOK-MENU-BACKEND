export interface CategoryUpdateData {
  name?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public displayOrder: number,
    public isActive: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public toggleActive(): void {
    this.isActive = !this.isActive;
  }

  public update(data: CategoryUpdateData): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.displayOrder !== undefined) this.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) this.isActive = data.isActive;
  }
}
