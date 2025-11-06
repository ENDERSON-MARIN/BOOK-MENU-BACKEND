import { User } from '../entities/User';
import { CreateUserDTO, UpdateUserDTO } from '../../dtos/UserDTOs';

export interface UserRepository {
  findByCpf(cpf: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(userData: CreateUserDTO): Promise<User>;
  update(id: string, userData: UpdateUserDTO): Promise<User>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<void>;
}
