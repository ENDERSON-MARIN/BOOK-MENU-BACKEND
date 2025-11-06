import { Category } from '../entities/Category';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../../dtos/CategoryDTOs';

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findActive(): Promise<Category[]>;
  findByDisplayOrder(): Promise<Category[]>;
  create(categoryData: CreateCategoryDTO): Promise<Category>;
  update(id: string, categoryData: UpdateCategoryDTO): Promise<Category>;
  delete(id: string): Promise<void>;
}
