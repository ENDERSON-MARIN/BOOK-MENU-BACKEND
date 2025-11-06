import { Request, Response } from "express"
import { AuthenticationService } from "@/app/modules/lunch-reservation/domain/services/AuthenticationService"
import { ZodError } from "zod"
import { AppError } from "@/app/shared"
import { loginSchema, refreshTokenSchema } from "../validators"

export class AuthController {
  constructor(private authenticationService: AuthenticationService) {}

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const data = loginSchema.parse(req.body)
      const result = await this.authenticationService.login({
        cpf: data.cpf,
        password: data.password,
      })

      return res.status(200).json({
        user: {
          id: result.user.id,
          cpf: result.user.cpf,
          name: result.user.name,
          role: result.user.role,
          userType: result.user.userType,
          status: result.user.status,
        },
        token: result.token,
      })
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Erro de validação",
          details: error.issues,
        })
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message,
        })
      }
      throw error
    }
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const data = refreshTokenSchema.parse(req.body)
      const newToken = await this.authenticationService.refreshToken(
        data.refreshToken
      )

      return res.status(200).json({
        token: newToken,
      })
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Erro de validação",
          details: error.issues,
        })
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message,
        })
      }
      throw error
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Token de acesso não fornecido",
        })
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      // For now, just validate the token (logout would require token blacklisting)
      await this.authenticationService.validateToken(token)

      return res.status(200).json({
        message: "Logout realizado com sucesso",
      })
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.message,
        })
      }
      throw error
    }
  }
}
