import { Request, Response, NextFunction } from "express"
import { AuthService } from "@/app/modules/auth/AuthService"
import { AppError } from "@/app/shared"
import { makeAuthModule } from "@/app/modules/auth"

export function createAuthenticateMiddleware(authService: AuthService) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          error: "Token não fornecido",
        })
        return
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix

      const decoded = await authService.validateToken(token)

      // Attach decoded user data to req.user
      req.user = {
        id: decoded.userId,
        cpf: decoded.cpf,
        name: decoded.cpf, // TokenPayload doesn't include name, using cpf as placeholder
        role: decoded.role,
        userType: "", // Not included in TokenPayload
        status: "ATIVO", // Assuming active if token is valid
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

// Export a default authenticate middleware instance using the shared auth module
const { authService } = makeAuthModule()
export const authenticate = createAuthenticateMiddleware(authService)
