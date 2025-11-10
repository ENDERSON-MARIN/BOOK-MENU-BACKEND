import { Request, Response, NextFunction } from "express"
import { UserRole } from "@/app/modules/auth/domain/User"

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is attached to request (should be set by authenticate middleware)
    if (!req.user) {
      res.status(401).json({
        error: "Token não fornecido",
      })
      return
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        error: "Acesso negado",
      })
      return
    }

    // User has required role, proceed to next middleware/handler
    next()
  }
}
