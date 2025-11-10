import { User } from "./User"

export interface UserRepository {
  findByCpf(cpf: string): Promise<User | null>
  findById(id: string): Promise<User | null>
}
