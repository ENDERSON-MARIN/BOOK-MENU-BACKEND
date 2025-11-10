import { UserRole } from "../domain/User"

export interface AuthResponseDTO {
  token: string
  user: {
    id: string
    cpf: string
    name: string
    role: UserRole
  }
}
