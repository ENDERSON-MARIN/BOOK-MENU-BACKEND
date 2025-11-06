import { MenuItem } from '../entities/MenuItem';
import { CreateMenuItemDTO, UpdateMenuItemDTO } from '../../dtos/MenuItemDTOs';

export interface MenuItemRepository {
  findByCategory(categoryId: string): Promise<MenuItem[]>;
  findById(id: string): Promise<MenuItem | null>;
  findActive(): Promise<MenuItem[]>;
  findActiveByCategoryId(categoryId: string): Promise<MenuItem[]>;
  findAll(): Promise<MenuItem[]>;
  create(itemData: CreateMenuItemDTO): Promise<MenuItem>;
  update(id: string, itemData: UpdateMenuItemDTO): Promise<MenuItem>;
  delete(id: string): Promise<void>;
}
