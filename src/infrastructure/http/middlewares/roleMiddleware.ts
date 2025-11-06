import { Request, Response, NextFunction } from "express"
import { UserRole } from "@/app/modules/lunch-reservation/domain/entities"

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Usuário não autenticado",
      })
      return
    }

    const userRole = req.user.role as UserRole

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: "Acesso negado. Permissões insuficientes.",
      })
      return
    }

    next()
  }
}

export function requireAdmin() {
  return requireRole(UserRole.ADMIN)
}

export function requireUser() {
  return requireRole(UserRole.USER, UserRole.ADMIN)
}
