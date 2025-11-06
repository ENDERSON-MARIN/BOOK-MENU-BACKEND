import { Menu } from '../entities/Menu';
import { MenuComposition } from '../entities/MenuComposition';
import { MenuVariation } from '../entities/MenuVariation';
import { CreateMenuDTO, UpdateMenuDTO } from '../../dtos/MenuDTOs';

export interface MenuWithDetails extends Menu {
  menuCompositions: MenuComposition[];
  variations: MenuVariation[];
}

export interface MenuRepository {
  findByDate(date: Date): Promise<Menu | null>;
  findByWeekNumber(weekNumber: number): Promise<Menu[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Menu[]>;
  findById(id: string): Promise<Menu | null>;
  findAll(): Promise<Menu[]>;
  findActive(): Promise<Menu[]>;
  findWithComposition(menuId: string): Promise<MenuWithDetails | null>;
  findWithCompositionByDate(date: Date): Promise<MenuWithDetails | null>;
  create(menuData: CreateMenuDTO): Promise<Menu>;
  update(id: string, menuData: UpdateMenuDTO): Promise<Menu>;
  delete(id: string): Promise<void>;
}
