import { Request, Response, NextFunction } from "express"
import { AuthenticationService } from "@/app/modules/lunch-reservation/domain/services/AuthenticationService"
import { AppError } from "@/app/shared"

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        cpf: string
        name: string
        role: string
        userType: string
        status: string
      }
    }
  }
}

export function createAuthMiddleware(
  authenticationService: AuthenticationService
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          error: "Token de acesso não fornecido",
        })
        return
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      const user = await authenticationService.validateToken(token)

      req.user = {
        id: user.userId,
        cpf: user.cpf,
        name: user.cpf, // TokenPayload doesn't have name, using cpf as placeholder
        role: user.role,
        userType: user.userType,
        status: "ATIVO", // TokenPayload doesn't have status, assuming active if token is valid
      }

      next()
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
        })
        return
      }

      res.status(401).json({
        error: "Token inválido",
      })
    }
  }
}
