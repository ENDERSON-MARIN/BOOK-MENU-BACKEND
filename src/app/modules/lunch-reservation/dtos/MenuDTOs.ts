import { DayOfWeek } from '../domain/entities/WeekDay';

export interface CreateMenuDTO {
  date: Date;
  observations?: string;
  isActive?: boolean;
  menuItems: CreateMenuCompositionDTO[];
}

export interface UpdateMenuDTO {
  observations?: string;
  isActive?: boolean;
}

export interface CreateMenuCompositionDTO {
  menuItemId: string;
  observations?: string;
  isMainProtein?: boolean;
  isAlternativeProtein?: boolean;
}

export interface MenuResponseDTO {
  id: string;
  date: Date;
  dayOfWeek: DayOfWeek;
  weekNumber: number;
  observations: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  menuCompositions?: MenuCompositionResponseDTO[];
  variations?: MenuVariationResponseDTO[];
}

export interface MenuCompositionResponseDTO {
  id: string;
  menuId: string;
  menuItemId: string;
  observations: string;
  isMainProtein: boolean;
  isAlternativeProtein: boolean;
}

export interface MenuVariationResponseDTO {
  id: string;
  menuId: string;
  variationType: string;
  proteinItemId: string;
  isDefault: boolean;
}
