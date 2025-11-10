import { UserRole } from "../domain/User"

export interface TokenPayload {
  userId: string
  cpf: string
  role: UserRole
  iat: number
  exp: number
}
