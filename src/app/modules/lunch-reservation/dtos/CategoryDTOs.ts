export interface CreateCategoryDTO {
  name: string;
  description: string;
  displayOrder: number;
  isActive?: boolean;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CategoryResponseDTO {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
