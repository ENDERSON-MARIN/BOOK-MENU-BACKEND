export interface CreateMenuItemDTO {
  name: string;
  description: string;
  categoryId: string;
  isActive?: boolean;
}

export interface UpdateMenuItemDTO {
  name?: string;
  description?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface MenuItemResponseDTO {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
